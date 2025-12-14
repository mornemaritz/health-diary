namespace HealthDiary.Api.Services;

/// <summary>
/// Service for rate limiting authentication attempts.
/// </summary>
public interface IRateLimitService
{
    bool IsAllowed(string identifier, int maxAttempts = 5, int windowSeconds = 60);
    void RecordAttempt(string identifier);
    void ResetAttempts(string identifier);
}

/// <summary>
/// In-memory implementation of rate limiting service.
/// </summary>
public class InMemoryRateLimitService : IRateLimitService
{
    private readonly Dictionary<string, (int attempts, DateTime resetTime)> _attempts = new();
    private readonly object _lockObject = new object();

    public bool IsAllowed(string identifier, int maxAttempts = 5, int windowSeconds = 60)
    {
        lock (_lockObject)
        {
            if (_attempts.TryGetValue(identifier, out var record))
            {
                if (DateTime.UtcNow > record.resetTime)
                {
                    _attempts.Remove(identifier);
                    return true;
                }

                return record.attempts < maxAttempts;
            }

            return true;
        }
    }

    public void RecordAttempt(string identifier)
    {
        lock (_lockObject)
        {
            if (_attempts.TryGetValue(identifier, out var record))
            {
                if (DateTime.UtcNow > record.resetTime)
                {
                    _attempts[identifier] = (1, DateTime.UtcNow.AddSeconds(60));
                }
                else
                {
                    _attempts[identifier] = (record.attempts + 1, record.resetTime);
                }
            }
            else
            {
                _attempts[identifier] = (1, DateTime.UtcNow.AddSeconds(60));
            }
        }
    }

    public void ResetAttempts(string identifier)
    {
        lock (_lockObject)
        {
            _attempts.Remove(identifier);
        }
    }
}
