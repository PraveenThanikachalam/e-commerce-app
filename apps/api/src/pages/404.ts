const notFound = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>404 - Page Not Found</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: Arial, sans-serif;
        background: linear-gradient(45deg, #1a1a1a, #2c2c2c);
        color: #fff;
      }
      .container {
        text-align: center;
        padding: 2rem;
      }
      .error-code {
        font-size: 120px;
        font-weight: bold;
        margin: 0;
        background: linear-gradient(45deg, #ff6b6b, #ff8e53);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
      }
      .error-text {
        font-size: 24px;
        margin: 1rem 0;
        color: #9e9e9e;
      }
      .back-button {
        display: inline-block;
        padding: 12px 24px;
        background: linear-gradient(45deg, #ff6b6b, #ff8e53);
        color: white;
        text-decoration: none;
        border-radius: 25px;
        font-weight: bold;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
      }
      .back-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1 class="error-code">404</h1>
      <p class="error-text">Oops! The page you're looking for doesn't exist.</p>
      <a href="/" class="back-button">Go Back Home</a>
    </div>
  </body>
</html>`;

export default notFound;
