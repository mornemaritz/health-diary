/**
 * fhir-form-builder.js
 *
 * Three-stage module:
 *   1. renderForm(questionnaire, container)  — FHIR Questionnaire JSON → HTML <form>
 *   2. collectResponse(formEl, questionnaire) — filled <form> → FHIR QuestionnaireResponse JSON
 *   3. responseToTurtle(response)            — QuestionnaireResponse JSON → RDF Turtle string
 *
 * Supports item types: group, display, choice (single + multi/repeats),
 *   open-choice, string, text, integer, decimal, boolean, date, dateTime, time, url.
 * Supports enableWhen conditions (operators: = != exists > < >= <=).
 *
 * No external dependencies. Works in any modern browser or Node.js.
 */

/* global module */

const FHIRFormBuilder = (() => {
  'use strict';

  // ─────────────────────────────────────────────────────────────────────────────
  // Utilities
  // ─────────────────────────────────────────────────────────────────────────────

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeTurtle(str) {
    return String(str ?? '')
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  /** Safe querySelector selector from a linkId (which may contain / and .) */
  function cssId(linkId) {
    return linkId.replace(/\//g, '-').replace(/\./g, '_').replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  /** querySelector with escaped attribute value */
  function qsByLinkId(root, linkId) {
    return root.querySelector(`[data-link-id="${linkId.replace(/"/g, '\\"')}"]`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Option helpers
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Normalise answerOption entries to { value, display, coding? }
   */
  function normaliseOptions(item) {
    return (item.answerOption || []).map(opt => {
      if (opt.valueCoding) {
        return {
          value: opt.valueCoding.code,
          display: opt.valueCoding.display ?? opt.valueCoding.code,
          coding: opt.valueCoding,
        };
      }
      if (opt.valueString !== undefined)  return { value: opt.valueString,        display: opt.valueString };
      if (opt.valueInteger !== undefined) return { value: String(opt.valueInteger), display: String(opt.valueInteger) };
      if (opt.valueDate !== undefined)    return { value: opt.valueDate,            display: opt.valueDate };
      return { value: String(opt), display: String(opt) };
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Form rendering
  // ─────────────────────────────────────────────────────────────────────────────

  const GROUP_ICONS = ['📋', '🏠', '💼', '🤝', '📝', '🩺', '📊'];
  let groupCounter = 0;

  function renderItem(item, depth) {
    switch (item.type) {
      case 'group':   return renderGroup(item, depth);
      case 'display': return renderDisplay(item);
      default:        return renderField(item);
    }
  }

  function renderGroup(item, depth) {
    const fs = document.createElement('fieldset');
    fs.className = depth === 0 ? 'fhir-section' : 'fhir-subgroup';
    fs.dataset.linkId = item.linkId;
    fs.dataset.type = 'group';

    const legend = document.createElement('legend');
    if (depth === 0) {
      legend.className = 'fhir-section-header';
      const icon = GROUP_ICONS[groupCounter++ % GROUP_ICONS.length];
      legend.innerHTML =
        `<span class="fhir-section-icon">${icon}</span>` +
        `<span class="fhir-section-title">${escapeHtml(item.text ?? item.linkId)}</span>`;
    } else {
      legend.className = 'fhir-subgroup-legend';
      legend.textContent = item.text ?? item.linkId;
    }
    fs.appendChild(legend);

    const body = document.createElement('div');
    body.className = 'fhir-section-body';
    (item.item ?? []).forEach(child => body.appendChild(renderItem(child, depth + 1)));
    fs.appendChild(body);
    return fs;
  }

  function renderDisplay(item) {
    const p = document.createElement('p');
    p.className = 'fhir-display';
    p.dataset.linkId = item.linkId;
    p.textContent = item.text ?? '';
    return p;
  }

  function renderField(item) {
    const wrapper = document.createElement('div');
    wrapper.className = 'fhir-field';
    wrapper.dataset.linkId = item.linkId;

    if (item.enableWhen) {
      wrapper.dataset.enableWhen = JSON.stringify(item.enableWhen);
      wrapper.dataset.enableBehavior = item.enableBehavior ?? 'all';
      wrapper.classList.add('fhir-conditional');
    }

    // Label
    const labelId = `lbl-${cssId(item.linkId)}`;
    const label = document.createElement('label');
    label.id = labelId;
    label.className = 'fhir-label';
    label.innerHTML = escapeHtml(item.text ?? item.linkId);
    if (item.required) {
      label.insertAdjacentHTML('beforeend', '<span class="fhir-required" aria-label="required"> *</span>');
    }
    if (item.code?.[0]) {
      label.insertAdjacentHTML('beforeend', `<span class="fhir-loinc">${escapeHtml(item.code[0].code)}</span>`);
    }
    wrapper.appendChild(label);

    // Control
    wrapper.appendChild(buildControl(item, labelId));
    return wrapper;
  }

  function buildControl(item, labelId) {
    const multiSelect = item.repeats === true;
    const id = `ctrl-${cssId(item.linkId)}`;

    switch (item.type) {
      case 'choice':
      case 'open-choice':
        return multiSelect
          ? buildCheckboxGroup(item, labelId)
          : buildSelect(item, id, labelId);

      case 'integer':
        return buildNumberInput(item, id, labelId, 1);

      case 'decimal':
        return buildNumberInput(item, id, labelId, 'any');

      case 'string':
        return buildTextInput(item, id, labelId, 'text');

      case 'text':
        return buildTextarea(item, id, labelId);

      case 'boolean':
        return buildBooleanInput(item, id, labelId);

      case 'date':
        return buildTextInput(item, id, labelId, 'date');

      case 'dateTime':
        return buildTextInput(item, id, labelId, 'datetime-local');

      case 'time':
        return buildTextInput(item, id, labelId, 'time');

      case 'url':
        return buildTextInput(item, id, labelId, 'url');

      default: {
        const p = document.createElement('p');
        p.className = 'fhir-unsupported';
        p.textContent = `(Unsupported type: ${item.type})`;
        return p;
      }
    }
  }

  function buildSelect(item, id, labelId) {
    const sel = document.createElement('select');
    sel.id = id;
    sel.name = item.linkId;
    sel.setAttribute('aria-labelledby', labelId);
    if (item.required) sel.required = true;

    const blank = new Option('— Select —', '');
    sel.add(blank);

    normaliseOptions(item).forEach(opt => {
      const o = new Option(opt.display, opt.value);
      if (opt.coding) o.dataset.coding = JSON.stringify(opt.coding);
      sel.add(o);
    });
    return sel;
  }

  function buildCheckboxGroup(item, labelId) {
    const div = document.createElement('div');
    div.className = 'fhir-checkbox-group';
    div.setAttribute('role', 'group');
    div.setAttribute('aria-labelledby', labelId);

    normaliseOptions(item).forEach(opt => {
      const lbl = document.createElement('label');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.name = item.linkId;
      cb.value = opt.value;
      if (opt.coding) cb.dataset.coding = JSON.stringify(opt.coding);
      lbl.appendChild(cb);
      lbl.appendChild(document.createTextNode(' ' + opt.display));
      div.appendChild(lbl);
    });
    return div;
  }

  function buildNumberInput(item, id, labelId, step) {
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.id = id;
    inp.name = item.linkId;
    inp.step = step;
    inp.setAttribute('aria-labelledby', labelId);
    if (item.required) inp.required = true;
    (item.extension ?? []).forEach(ext => {
      if (ext.url.endsWith('minValue')) inp.min = ext.valueInteger ?? ext.valueDecimal ?? '';
      if (ext.url.endsWith('maxValue')) inp.max = ext.valueInteger ?? ext.valueDecimal ?? '';
    });
    return inp;
  }

  function buildTextInput(item, id, labelId, type) {
    const inp = document.createElement('input');
    inp.type = type;
    inp.id = id;
    inp.name = item.linkId;
    inp.setAttribute('aria-labelledby', labelId);
    if (item.required) inp.required = true;
    if (item.maxLength) inp.maxLength = item.maxLength;
    return inp;
  }

  function buildTextarea(item, id, labelId) {
    const ta = document.createElement('textarea');
    ta.id = id;
    ta.name = item.linkId;
    ta.rows = 3;
    ta.setAttribute('aria-labelledby', labelId);
    if (item.required) ta.required = true;
    if (item.maxLength) ta.maxLength = item.maxLength;
    return ta;
  }

  function buildBooleanInput(item, id, labelId) {
    const wrap = document.createElement('div');
    wrap.className = 'fhir-boolean';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = id;
    cb.name = item.linkId;
    cb.setAttribute('aria-labelledby', labelId);
    wrap.appendChild(cb);
    return wrap;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // enableWhen conditional logic
  // ─────────────────────────────────────────────────────────────────────────────

  function attachEnableWhen(formEl) {
    const conditionals = Array.from(formEl.querySelectorAll('.fhir-conditional'));
    if (!conditionals.length) return;

    function evaluate() {
      conditionals.forEach(field => {
        const conditions = JSON.parse(field.dataset.enableWhen);
        const behavior   = field.dataset.enableBehavior ?? 'all';
        const results    = conditions.map(c => checkCondition(c, formEl));
        const enabled    = behavior === 'any' ? results.some(Boolean) : results.every(Boolean);

        field.style.display = enabled ? '' : 'none';
        field.querySelectorAll('input, select, textarea').forEach(el => {
          el.disabled = !enabled;
        });
      });
    }

    formEl.addEventListener('change', evaluate);
    evaluate();
  }

  function checkCondition(cond, formEl) {
    const { question, operator } = cond;
    const els = Array.from(formEl.querySelectorAll(`[name="${question.replace(/"/g, '\\"')}"]`));
    if (!els.length) return false;

    const answerValue =
      cond.answerCoding?.code ??
      cond.answerBoolean ??
      cond.answerDecimal ??
      cond.answerInteger ??
      cond.answerDate ??
      cond.answerString;

    let current;
    if (els[0].type === 'checkbox' && els.length > 1) {
      current = els.filter(e => e.checked).map(e => e.value);
    } else if (els[0].type === 'checkbox') {
      current = els[0].checked;
    } else {
      current = els[0].value;
    }

    switch (operator) {
      case '=':
        return Array.isArray(current)
          ? current.includes(String(answerValue))
          : current === String(answerValue);
      case '!=':
        return Array.isArray(current)
          ? !current.includes(String(answerValue))
          : current !== String(answerValue);
      case 'exists':
        return Array.isArray(current) ? current.length > 0 : current !== '' && current !== false;
      case '>':  return Number(current) >  Number(answerValue);
      case '<':  return Number(current) <  Number(answerValue);
      case '>=': return Number(current) >= Number(answerValue);
      case '<=': return Number(current) <= Number(answerValue);
      default:   return true;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Response collection  (form → FHIR QuestionnaireResponse JSON)
  // ─────────────────────────────────────────────────────────────────────────────

  function collectItems(items, formEl) {
    const out = [];

    for (const item of (items ?? [])) {
      if (item.type === 'display') continue;

      if (item.type === 'group') {
        const children = collectItems(item.item, formEl);
        if (children.length) {
          out.push({ linkId: item.linkId, text: item.text, item: children });
        }
        continue;
      }

      // Skip fields hidden by enableWhen
      const fieldEl = qsByLinkId(formEl, item.linkId);
      if (fieldEl?.querySelector(':disabled')) continue;

      const answers = collectAnswers(item, formEl);
      if (answers.length) {
        out.push({ linkId: item.linkId, text: item.text, answer: answers });
      }
    }
    return out;
  }

  function collectAnswers(item, formEl) {
    const name = item.linkId;

    if (item.type === 'boolean') {
      const el = formEl.querySelector(`[name="${name.replace(/"/g, '\\"')}"]`);
      return el ? [{ valueBoolean: el.checked }] : [];
    }

    // Multi checkbox
    const checkboxes = Array.from(
      formEl.querySelectorAll(`input[type="checkbox"][name="${name.replace(/"/g, '\\"')}"]`)
    );
    if (checkboxes.length > 1) {
      return checkboxes
        .filter(cb => cb.checked)
        .map(cb => answerFromCb(cb, item));
    }

    // Single select (choice)
    if (item.type === 'choice' || item.type === 'open-choice') {
      const sel = formEl.querySelector(`select[name="${name.replace(/"/g, '\\"')}"]`);
      if (!sel || !sel.value) return [];
      return [answerFromSelectOption(sel.options[sel.selectedIndex], item)];
    }

    const el = formEl.querySelector(`[name="${name.replace(/"/g, '\\"')}"]`);
    if (!el || el.disabled || el.value === '') return [];

    switch (item.type) {
      case 'integer':  return [{ valueInteger:  parseInt(el.value, 10) }];
      case 'decimal':  return [{ valueDecimal:  parseFloat(el.value) }];
      case 'boolean':  return [{ valueBoolean:  el.checked }];
      case 'date':     return [{ valueDate:      el.value }];
      case 'dateTime': return [{ valueDateTime:  el.value.replace('T', 'T') }];
      case 'time':     return [{ valueTime:      el.value }];
      case 'url':      return [{ valueUri:       el.value }];
      default:
        return el.value.trim() ? [{ valueString: el.value.trim() }] : [];
    }
  }

  function answerFromCb(cb, item) {
    if (cb.dataset.coding) return { valueCoding: JSON.parse(cb.dataset.coding) };
    // Try to resolve from answerOption
    const match = (item.answerOption ?? []).find(ao => ao.valueCoding?.code === cb.value);
    if (match?.valueCoding) return { valueCoding: match.valueCoding };
    return { valueCoding: { code: cb.value, display: cb.parentElement?.textContent?.trim() } };
  }

  function answerFromSelectOption(opt, item) {
    if (opt.dataset.coding) return { valueCoding: JSON.parse(opt.dataset.coding) };
    const match = (item.answerOption ?? []).find(ao => ao.valueCoding?.code === opt.value);
    if (match?.valueCoding) return { valueCoding: match.valueCoding };
    return { valueCoding: { code: opt.value, display: opt.text } };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Turtle serialisation  (FHIR QuestionnaireResponse JSON → RDF Turtle)
  // ─────────────────────────────────────────────────────────────────────────────

  function responseToTurtle(response) {
    const id = response.id ?? generateUUID();
    const lines = [
      '@prefix fhir: <http://hl7.org/fhir/> .',
      '@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .',
      '@prefix xsd:  <http://www.w3.org/2001/XMLSchema#> .',
      '',
      `<urn:uuid:${id}>`,
      '        a fhir:QuestionnaireResponse ;',
      '        fhir:nodeRole fhir:treeRoot ;',
      `        fhir:Resource.id [ fhir:value "${escapeTurtle(id)}" ] ;`,
      `        fhir:QuestionnaireResponse.questionnaire [ fhir:value "${escapeTurtle(response.questionnaire ?? '')}" ] ;`,
      `        fhir:QuestionnaireResponse.status [ fhir:value "completed" ] ;`,
      `        fhir:QuestionnaireResponse.authored [ fhir:value "${escapeTurtle(response.authored)}"^^xsd:dateTime ] ;`,
    ];

    if (response.item?.length) {
      lines.push('        fhir:QuestionnaireResponse.item (');
      response.item.forEach((item, i) => ttlResponseItem(item, i, lines, '          '));
      lines.push('        ) .');
    } else {
      lines[lines.length - 1] = lines[lines.length - 1].replace(/ ;$/, ' .');
    }

    return lines.join('\n');
  }

  function ttlResponseItem(item, index, lines, pad) {
    lines.push(`${pad}[`);
    lines.push(`${pad}    fhir:index ${index} ;`);
    lines.push(`${pad}    fhir:QuestionnaireResponse.item.linkId [ fhir:value "${escapeTurtle(item.linkId)}" ] ;`);
    if (item.text) {
      lines.push(`${pad}    fhir:QuestionnaireResponse.item.text [ fhir:value "${escapeTurtle(item.text)}" ] ;`);
    }

    if (item.item?.length) {
      lines.push(`${pad}    fhir:QuestionnaireResponse.item.item (`);
      item.item.forEach((child, ci) => ttlResponseItem(child, ci, lines, pad + '      '));
      lines.push(`${pad}    )`);
    } else if (item.answer?.length) {
      lines.push(`${pad}    fhir:QuestionnaireResponse.item.answer (`);
      item.answer.forEach((ans, ai) => ttlAnswer(ans, ai, lines, pad + '      '));
      lines.push(`${pad}    )`);
    }
    lines.push(`${pad}]`);
  }

  function ttlAnswer(answer, index, lines, pad) {
    lines.push(`${pad}[`);
    lines.push(`${pad}    fhir:index ${index} ;`);

    if (answer.valueCoding) {
      const c = answer.valueCoding;
      lines.push(`${pad}    fhir:QuestionnaireResponse.item.answer.valueCoding [`);
      lines.push(`${pad}        a fhir:Coding ;`);
      if (c.system)   lines.push(`${pad}        fhir:Coding.system  [ fhir:value "${escapeTurtle(c.system)}" ] ;`);
      if (c.code)     lines.push(`${pad}        fhir:Coding.code    [ fhir:value "${escapeTurtle(c.code)}" ] ;`);
      if (c.display)  lines.push(`${pad}        fhir:Coding.display [ fhir:value "${escapeTurtle(c.display)}" ]`);
      lines.push(`${pad}    ]`);
    } else if (answer.valueString !== undefined) {
      lines.push(`${pad}    fhir:QuestionnaireResponse.item.answer.valueString [ fhir:value "${escapeTurtle(answer.valueString)}" ]`);
    } else if (answer.valueInteger !== undefined) {
      lines.push(`${pad}    fhir:QuestionnaireResponse.item.answer.valueInteger [ fhir:value "${answer.valueInteger}"^^xsd:integer ]`);
    } else if (answer.valueDecimal !== undefined) {
      lines.push(`${pad}    fhir:QuestionnaireResponse.item.answer.valueDecimal [ fhir:value "${answer.valueDecimal}"^^xsd:decimal ]`);
    } else if (answer.valueBoolean !== undefined) {
      lines.push(`${pad}    fhir:QuestionnaireResponse.item.answer.valueBoolean [ fhir:value ${answer.valueBoolean} ]`);
    } else if (answer.valueDate !== undefined) {
      lines.push(`${pad}    fhir:QuestionnaireResponse.item.answer.valueDate [ fhir:value "${escapeTurtle(answer.valueDate)}"^^xsd:date ]`);
    } else if (answer.valueDateTime !== undefined) {
      lines.push(`${pad}    fhir:QuestionnaireResponse.item.answer.valueDateTime [ fhir:value "${escapeTurtle(answer.valueDateTime)}"^^xsd:dateTime ]`);
    } else if (answer.valueTime !== undefined) {
      lines.push(`${pad}    fhir:QuestionnaireResponse.item.answer.valueTime [ fhir:value "${escapeTurtle(answer.valueTime)}" ]`);
    } else if (answer.valueUri !== undefined) {
      lines.push(`${pad}    fhir:QuestionnaireResponse.item.answer.valueUri [ fhir:value "${escapeTurtle(answer.valueUri)}" ]`);
    }

    lines.push(`${pad}]`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Parse a FHIR Questionnaire JSON string or object and render it as a <form>
   * inside `container`.  Returns the created <form> element.
   *
   * @param {object|string} questionnaire  FHIR R4 Questionnaire resource
   * @param {HTMLElement}   container      DOM element to render into
   * @returns {HTMLFormElement}
   */
  function renderForm(questionnaire, container) {
    if (typeof questionnaire === 'string') questionnaire = JSON.parse(questionnaire);

    groupCounter = 0;
    container.innerHTML = '';

    const form = document.createElement('form');
    form.className = 'fhir-questionnaire';
    form.noValidate = true;
    form.dataset.questionnaireUrl   = questionnaire.url   ?? '';
    form.dataset.questionnaireTitle = questionnaire.title ?? '';

    (questionnaire.item ?? []).forEach(item => form.appendChild(renderItem(item, 0)));

    container.appendChild(form);
    attachEnableWhen(form);
    return form;
  }

  /**
   * Walk the rendered form and produce a FHIR QuestionnaireResponse JSON object.
   *
   * @param {HTMLFormElement} formEl
   * @param {object}          questionnaire  Original Questionnaire (for item metadata)
   * @returns {object}  FHIR QuestionnaireResponse
   */
  function collectResponse(formEl, questionnaire) {
    if (typeof questionnaire === 'string') questionnaire = JSON.parse(questionnaire);
    const now = new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');
    return {
      resourceType: 'QuestionnaireResponse',
      id: generateUUID(),
      questionnaire: questionnaire.url ?? formEl.dataset.questionnaireUrl ?? '',
      status: 'completed',
      authored: now,
      item: collectItems(questionnaire.item, formEl),
    };
  }

  /**
   * Serialise a FHIR QuestionnaireResponse JSON object to an RDF Turtle string.
   * The output follows the FHIR RDF encoding used by HL7 tooling.
   *
   * @param {object} response  FHIR QuestionnaireResponse
   * @returns {string}  Turtle source
   */
  function toTurtle(response) {
    return responseToTurtle(response);
  }

  return { renderForm, collectResponse, toTurtle };
})();

// CommonJS / Node.js export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FHIRFormBuilder;
}
