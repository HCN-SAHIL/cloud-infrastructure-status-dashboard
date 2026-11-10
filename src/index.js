
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // HEALTH CHECK API
    if (url.pathname === "/api/health" && request.method === "GET") {
      const startTime = Date.now();

      try {
        const result = await env.DB
          .prepare("SELECT 1 AS ok")
          .first();

        if (result?.ok !== 1) {
          throw new Error("Database health check failed");
        }

        const responseTimeMs = Date.now() - startTime;
        const timestamp = new Date().toISOString();

        // Save health check in D1
        await env.DB.prepare(`
          INSERT INTO health_checks
          (service_name, api_status, database_status,
           response_time_ms, error_message)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          "Infrawatch Worker API",
          "healthy",
          "connected",
          responseTimeMs,
          null
        ).run();

        return Response.json({
          success: true,
          message: "Infrawatch API is running",
          database: "connected",
          responseTimeMs,
          timestamp
        });

      } catch (error) {
        return Response.json({
          success: false,
          message: "Health check failed",
          database: "disconnected",
          error: error.message,
          timestamp: new Date().toISOString()
        }, { status: 500 });
      }
    }

    // HEALTH HISTORY API
    if (url.pathname === "/api/history" && request.method === "GET") {
      try {
        const result = await env.DB.prepare(`
          SELECT id, service_name, api_status,
                 database_status, response_time_ms,
                 error_message, checked_at
          FROM health_checks
          ORDER BY id DESC
          LIMIT 20
        `).all();

        return Response.json({
          success: true,
          total: result.results.length,
          checks: result.results
        });

      } catch (error) {
        return Response.json({
          success: false,
          error: error.message
        }, { status: 500 });
      }
    }

    return Response.json({
      success: false,
      message: "API route not found"
    }, { status: 404 });
  }
};

