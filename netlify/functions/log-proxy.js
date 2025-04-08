// Netlify function to proxy logs to Betterstack
// This helps avoid CORS issues when sending logs from the browser

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse the request body
    const payload = JSON.parse(event.body);
    
    // Get Betterstack configuration from environment variables
    const sourceId = process.env.BETTERSTACK_SOURCE_ID || payload.source_id;
    const sourceToken = process.env.BETTERSTACK_SOURCE_TOKEN || '4LkyLpefUiqkjeda8B7E2mKx';
    const host = process.env.BETTERSTACK_HOST || 's1266395.eu-nbg-2.betterstackdata.com';
    
    // Ensure we have the required credentials
    if (!sourceToken) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing Betterstack credentials' }),
      };
    }
    
    // Prepare the log payload
    const logPayload = {
      dt: payload.dt || new Date().toISOString(),
      level: payload.level || 'info',
      message: payload.message || 'No message provided',
      source_id: sourceId,
      metadata: payload.metadata || {},
    };
    
    // Add function metadata
    logPayload.metadata.proxy = {
      timestamp: new Date().toISOString(),
      netlify: true,
      region: context.functionName,
    };
    
    // Send log to Betterstack - using root endpoint as specified in documentation
    const response = await fetch(`https://${host}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sourceToken}`,
      },
      body: JSON.stringify(logPayload),
    });
    
    // Check if the request was successful - expect 202 status
    if (response.status !== 202) {
      const errorText = await response.text();
      console.error('Error from Betterstack:', errorText);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Error from Betterstack', details: errorText }),
      };
    }
    
    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Error in log-proxy function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error', message: error.message }),
    };
  }
};
