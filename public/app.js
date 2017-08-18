//Youtube-map
// https://developers.google.com/youtube/v3/docs/search
// https://developers.google.com/youtube/iframe_api_reference#Loading_a_Video_Player
// https://stackoverflow.com/questions/203198/event-binding-on-dynamically-created-elements

var vid = ''
var tree = []
var depth = 3
var children = 3
var max = 0

setMax()

console.log(max)

$('#search_query_form').submit(function(){
	event.preventDefault()
	var query = $('#query').val()
	search(query, function(result){
		console.log(result)
		var id = result[0]['id']['videoId']
		tree = []
		player.loadVideoById(id)
		getRelated(id, tree, recurse, 0)
	})
})

$('#search_id_form').submit(function(){
	event.preventDefault()
	var id = $('#id').val()
	tree = []
	player.loadVideoById(id)
	getRelated(id, tree, recurse, 0)
})



function setMax(){
	for(var i = 0; i <= depth; i++){
		max += Math.pow(children, i)
	}
}

function search(query, cb){
	$.get("search/" + query, function(result){
		cb(result)
	})
}

function getRelated(id, head, cb, cd){
	$.get("related/" + id, function(related){
		related = JSON.parse(related)
		cb(related, head, cd)
	})	
}


function recurse(related, head, current_depth){
	max--
	cols = related['items'].length
	related['items'].forEach((i) => {
		if(current_depth == 0){
			head.push({
				title: i['snippet']['title'],
				id: i['id']['videoId'],
				thumbnail: i['snippet']['thumbnails']['medium']['url'],
				depth: current_depth,
				related: []
			})
		}else{
			head['related'].push({
				title: i['snippet']['title'],
				id: i['id']['videoId'],
				thumbnail: i['snippet']['thumbnails']['medium']['url'],
				depth: current_depth,
				related: []
			})	
		}
		
	})

	if(current_depth < depth){
		if(current_depth == 0){
			current_depth = 1
			for(var i = 0; i < cols; i++){
				getRelated(head[i]['id'], head[i], recurse, current_depth)		
			}	
		}else{
			current_depth++
			for(var i = 0; i < cols; i++){
				getRelated(head['related'][i]['id'], head['related'][i], recurse, current_depth)		
			}		
		}

	}else if(max == 0){
			console.log('done')
			console.log(tree)
			setMax()
			$('#related').html(render("", null, 0, true))

	}

}


//DFS
// function render(temp, bit, depth, init){
// 	if(bit && bit.length > 0){
// 		depth++
// 		for(var i = 0; i < bit.length; i++){
// 			temp += "<img style='vertical-align:middle;width:" + imgWidth(depth) + "px'src='" + bit[i]['thumbnail'] +"'><a style='font-size: " + fontSize(depth) + "px' href='javascript:void(0)' class='play_vid' data-id=" + bit[i]['id'] + ">" + bit[i]['title'] + "</a><br><br>"
// 			temp = render(temp, bit[i]['related'], depth)
// 		}
// 	}else if(init){
// 		depth++
// 		for(var i = 0; i < tree.length; i++){
// 			temp += "<img style='vertical-align:middle;' src='" + tree[i]['thumbnail'] +"'><a style='font-size: " + fontSize(depth) + "px' href='javascript:void(0)' class='play_vid' data-id=" + tree[i]['id'] + ">" + tree[i]['title'] + "</a><br><br>"
// 			temp = render(temp, tree[i]['related'], depth)
// 		}
// 	}
// 	return temp
// }

//BFS
function render(temp){
	var q = []
	for(var i = 0; i < tree.length; i++){
		q.push(tree[i])
		temp += "<img style='vertical-align:middle;width:" + imgWidth(1) + "px' src='" + tree[i]['thumbnail'] +"'><a style='font-size: " + fontSize(depth) + "px' href='javascript:void(0)' class='play_vid' data-id=" + tree[i]['id'] + ">" + tree[i]['title'] + "</a><br><br>"
	}

	while(q.length > 0){
		var thisNode = q.shift()

		if(thisNode['related'].length > 0){
			for(var i = 0; i < thisNode['related'].length; i++){
				q.push(thisNode['related'][i])
				var d = (thisNode['related'][i]['depth']) + 1
				temp += "<img style='vertical-align:middle; width:" + imgWidth(d) + "px' src='" + thisNode['related'][i]['thumbnail'] +"'>" +
				"<a style='font-size: " + fontSize(d) + "px' href='javascript:void(0)' class='play_vid' data-id=" + thisNode['related'][i]['id'] + ">" + thisNode['related'][i]['title'] + "</a>"+
				"<br><br>"
			}
		}
	}
	// temp = render(temp, tree[i]['related'], depth)

	return temp
}


function fontSize(depth){
	return parseInt(depth) * -3 + 27
}

function imgWidth(depth){
	return 320/(depth)
}


$('body').on("click", "a.play_vid", function(event){
	event.preventDefault()
	var vid = $(this).data("id")
	// player.cueVideoById(vid)
	player.loadVideoById(vid)
})


$('body').on("click", "a.seed", function(event){
	event.preventDefault()
	var vid = $(this).data("id")
	player.loadVideoById(vid)
	tree = []
	getRelated(vid, tree, recurse, 0)
})







  // 2. This code loads the IFrame Player API code asynchronously.
  var tag = document.createElement('script');

  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // 3. This function creates an <iframe> (and YouTube player)
  //    after the API code downloads.
  var player;
  function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
      height: '390',
      width: '640',
      videoId: vid,
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
  }

  // 4. The API will call this function when the video player is ready.
  function onPlayerReady(event) {
    // event.target.playVideo();
  }

  // 5. The API calls this function when the player's state changes.
  //    The function indicates that when playing a video (state=1),
  //    the player should play for six seconds and then stop.
  var done = false;
  function onPlayerStateChange(event) {
    // if (event.data == YT.PlayerState.PLAYING && !done) {
    //   setTimeout(stopVideo, 6000);
    //   done = true;
    // }

	// if(event.data == YT.PlayerState.ENDED){
	// 	alert('end')
	// }
  }
  function stopVideo() {
    player.stopVideo();
  }

