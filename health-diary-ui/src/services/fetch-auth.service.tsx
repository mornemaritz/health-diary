import { getSolidDataset } from "@inrupt/solid-client";
import { solidAuth } from "./solid-auth.service";

export async function getPodData(url: string) {
  const session = solidAuth.getSession();

  const data = await getSolidDataset(url, {
    fetch: session.fetch
  });

  return data;
}