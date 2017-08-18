const express = require('express')
const request = require('request')
const port = 3000
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const config = require('./config.json')



app.get('/search/:query', function(req, res){
	var query = req.params.query
	searchVid(query, (vid) => {
		res.header('Content-Type', 'application/json; charset=UTF-8')
		res.end(JSON.stringify(vid))
	})

})


app.get('/related/:videoid', function(req, res){
	var video_id = req.params.videoid
	getRelatedVids(video_id, (related) => {
		res.header('Content-Type', 'application/json; charset=UTF-8')
		res.end(JSON.stringify(related))
	})		

})

app.use(express.static('public'))

function searchVid(query, cb){
// https://www.googleapis.com/youtube/v3/search?part=snippet&order=viewCount&q=skateboarding+dog&type=video&videoDefinition=high&key={YOUR_API_KEY}

	var url = "https://www.googleapis.com/youtube/v3/search?" +
				"part=snippet" +
				"&q=" + encodeURIComponent(query) +
				"&type=video" + 
				"&maxResults=5" + 
				"&key=" + config['youtube_api_key']

	request(url, function(error, response, body){
		if(error){
			cb('Error occurred getting youtube information')
		}else{
			var json = JSON.parse(body)
			var result = json['items']
			cb(result)
		}
	})	
}

function getRelatedVids(id, cb){
	var url = "https://www.googleapis.com/youtube/v3/search?" +
				"part=id,snippet" +
				"&type=video" + 
				"&relatedToVideoId=" + id +
				"&maxResults=3" + 
				"&key=" + config['youtube_api_key']

	request(url, function(error, response, body){
		if(error){
			cb('Error occurred getting youtube information')
		}else{
			cb(body)
		}
	})	
}

app.listen(port, function(){
	console.log('Youtube-map server started on port ' + port)
})