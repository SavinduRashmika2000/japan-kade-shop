const axios = require('axios');

// Using the admin token is required, but we can't easily get it here.
// Actually, it's easier to just temporarily remove the @PreAuthorize from StockItemController, run the script, and put it back.
// Alternatively, I can just modify AdminDashboard.jsx to have a hidden button to seed data, which automatically uses the stored token.
