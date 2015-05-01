var BloggerController = require('./controllers/blogger');

exports.serveRoutes = function(router) {
    router.get('/v0.1/bloggers', function(req, res) {
		BloggerController.getAllProfiles(true, function (profiles, error) {
			if(error) {
				res.send(error);
			}
			else {
				res.json(profiles);
			}
		});
	});
	
    router.get('/v0.1/bloggers/:vanityurl', function(req, res) {
		var vanityUrl = req.params.vanityurl;
		BloggerController.getProfileByVanityUrl(vanityUrl, function (profile, error) {
			if(error) {
				res.send(error);
			}
			else {
				res.json(profile);
			}
		});
	});
    
    // Handle error 404
    router.use(function(req, res) {
        console.error('ERROR 404. Request: %j', req);
        res.status(404);
        res.json({
            error: '404 Not Found'
        });
    });
    
    // Handle error 500
    router.use(function(error, req, res, next) {
        console.error("ERROR 500. Error: %j", error);
        res.status(500);
        res.json({
            error: '500 Internal Server Error'
        });
    });
};
