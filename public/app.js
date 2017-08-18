//Youtube-map
// https://developers.google.com/youtube/v3/docs/search
// https://developers.google.com/youtube/iframe_api_reference#Loading_a_Video_Player
// https://stackoverflow.com/questions/203198/event-binding-on-dynamically-created-elements

var vid = ''
var tree = []
var depth = 3
var children = 3
var max = 0

for(var i = 0; i <= depth; i++){
	max += Math.pow(children, i)
}

console.log(max)

$('#search_form').submit(function(){
	event.preventDefault()
	var id = $('#id').val()

	getRelated(id, tree, recurse, 0)
})



function getRelated(id, head, cb, cd, cc){
	$.get("related/" + id, function(related){
		related = JSON.parse(related)
		cb(related, head, cd, cc)
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
				related: []
			})
		}else{
			head['related'].push({
				title: i['snippet']['title'],
				id: i['id']['videoId'],
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
			render("", null, 0, true)
	}

}

function render(temp, bit, depth, init){
	var indent = ""
	while(indent.length < depth * 7){
		indent += "~~"
	}
	if(bit && bit.length > 0){
		depth++
		for(var i = 0; i < bit.length; i++){
			temp += indent
			temp += "<a style='font-size: " + fontSize(depth) + "px' href='javascript:void(0)' class='play_vid' data-id=" + bit[i]['id'] + ">" + bit[i]['title'] + "</a><br>"
			temp = render(temp, bit[i]['related'], depth)
		}
	}else if(init){
		depth++
		for(var i = 0; i < tree.length; i++){
			temp += "<a style='font-size: " + fontSize(depth) + "px' href='javascript:void(0)' class='play_vid' data-id=" + tree[i]['id'] + ">" + tree[i]['title'] + "</a><br>"
			temp = render(temp, tree[i]['related'], depth)
		}
	}
	$('#related').html(temp)
	return temp

	
}

function fontSize(depth){
	return parseInt(depth) * -3 + 27
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
	if(event.data == YT.PlayerState.ENDED){
		alert('end')
	}
  }
  function stopVideo() {
    player.stopVideo();
  }

