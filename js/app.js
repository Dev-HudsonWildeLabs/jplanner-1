$('document').ready(function(){
	showInfo('Hello');
	generateDayList();
});
function showInfo(text){
	
	$('#top_info').show();
	$('#top_info').html(text);
	
}
function hideInfo(){
	$('#top_info').hide();
}
function generateDayList(){
	var currentDay=moment().startOf('day');
	var begin=moment(currentDay).subtract(10, 'days');
	var end=moment(currentDay).add(10, 'days');

	showInfo(currentDay.format()+';'+begin.format()+';'+end.format());
	var stamp=begin.unix();
	var day=moment(currentDay).subtract(8, 'days');
	

  	$.ajax({
	    url: "http://localhost:8089/api.php",
	    dataType: 'jsonp',
	    jsonp:"callback",
	    settings:{
	        cache:false
	    },
	    data:{
	        start:stamp,
	        func:'load',
	        length:14*24*3600,
	        key:'NicholasDickey'
	        
	    },
	    context:this
    }).success(function(data) {
        var items = [];
        console.log(data);
        if(!data.success){
            $('#top_info').show().addClass('alert alert-danger').html("Error: server side error "+data.msg);
            return;
        }
        var events=data.events;
       // console.log('posts %o',posts);
        /*
         $('#recent_posts').empty();
        $.each( posts, function( key, val ) {
            $('#recent_posts').append(buildCommentHtml(val.forum,val.id,val.message,val.createdat,val.author_name,val.author_profileurl,val.author_avatar_cache,val.thread_title,val.thread_url));
        
        });
		*/
		var eIndex=0;
    	for(var i=0;i<14;i++){
			var item=new Object();
			day.add(1,'days');
			item.dateStr=day.format('l');
			item.unixstamp=day.unix();
			var itemEvents=[];
			while(true){
				if(eIndex>=events.length)
					break;
				var cEvent=events[eIndex];
				if(cEvent.event_time>item.unixstamp){
					if(cEvent.event_time<item.unixstamp+24*3600){
						itemEvents[cEvent.event_time]=cEvent;
						eIndex++;
					}
					else{
						break;
					}
				}
			}
			item.events=item
			items.push(item);
		}
		console.log(items);
		renderDays(items);    
    });
}
function renderDays(items){
	$.each( items, function( key, val ) {
       $('#days_list').append(buildDayHtml(val,false));
        
    });
}
function buildDayHtml(item,full){
	var html=
		'<li class="list-group-item">'+
		' <div class="panel panel-default"><div class="panel-heading">'+item.dateStr+'</div><div class="panel-body">';
	var items=item.items;
	$.each( items, function( key, val ) {
       html+=val.json;
    });
	
	html+='</div></li>'; 
}