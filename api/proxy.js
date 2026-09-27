module.exports = async function handler(req, res) {
  try {
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname + url.search;
    const targetUrl = 'https://www.startupxlaunch.com' + path;
    
    // Forward all headers except host
    const headers = { ...req.headers };
    delete headers.host;
    delete headers.referer;
    
    const options = {
      method: req.method,
      headers: headers,
    };
    
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      if (chunks.length > 0) options.body = Buffer.concat(chunks);
    }
    
    const fetchRes = await fetch(targetUrl, options);
    const data = await fetchRes.arrayBuffer();
    
    // Copy headers from target response
    for (const [key, value] of fetchRes.headers.entries()) {
      res.setHeader(key, value);
    }
    res.status(fetchRes.status).send(Buffer.from(data));
  } catch (error) {
    res.status(500).json({ error: 'Proxy error', details: error.message });
  }
};