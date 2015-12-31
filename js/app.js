var items = [];
$('document').ready(function(){
	$(".date-picker").datepicker();

	generateDayList();
	$('#days_list').on('click','.panel',function(){
		var i=$(this).attr('data-ind');
		$('#day_zoom_panel').html(buildDayHtml(items[i],true,i));
		
	});
	$('#day_zoom_panel').on('click','button',function(){
		var i=$(this).attr('data-ind');
		var item=items[i];
		console.log(item);
		var dateStr=item.dateStr;
		var datePicker=$('#datepicker1');
		$('#description').val('');
		datePicker.datepicker('setDate', new Date(dateStr));
		    $('#timepicker1').timepicker({
                minuteStep: 15,
                showInputs: false,
        		template:false
            });
		$('#datepicker1').datepicker({
                    format: "dd/mm/yyyy",
                    defaultViewDate:dateStr
        });  
        $('#submitevent').off('click').click(function(){
			var date=$('#datepicker1').val();
			var time=$('#timepicker1').val();
			var t=new Date(date+' '+time);
			var ts=t.getTime()/1000;
			var description=$('#description').val();
			console.log('date=%s,time=%s,description=%s,t=%o,ts=%s',date,time,description,t,ts);
			var event =new Object;
			event.event_time=ts;
			event.id=0;
			var colorRed=255-Math.random()*64;
	       	var colorGreen=255-Math.random()*64;
	       	var colorBlue=255-Math.random()*64;
	       	var color=new RGBColour(colorRed,colorGreen,colorBlue).getCSSHexadecimalRGB();

			event.json='{"description":'+JSON.stringify(description)+',"color":'+JSON.stringify(color)+'}';
			item.events.push(event);
			//items[i]=item;
			//generateDayList();
			$('#day_zoom_panel').html(buildDayHtml(item,true,i));
			return true;
		});
	});
	
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

	//showInfo(currentDay.format()+';'+begin.format()+';'+end.format());
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
			item.events=itemEvents;
			items[i]=item;
		}
		console.log(items);
		renderDays(items);    
    });
}
function renderDays(items){
    var i=0;
	$.each( items, function( key, val) {
		
		var s=	buildDayHtml(val,false,i++);
		//console.log(s);
       $('#days_list').append(s);
        
    });
}
function buildDayHtml(item,full,index){
	var html="";
	if(!full){
		
		html=' <div class="panel panel-default" style="margin-bottom:1px;" data-ind="'+index+'"><div class="panel-heading">'+item.dateStr+'</div><div class="panel-body">';
		var items=item.items;
		if(items)
			$.each( items, function( key, val ) {
		       html+=val.json;
		    });
	}
	else {
		console.log('buildDayHtml')
		var stamp=item.unixstamp;
		var mx=24*3600;


		html=' <div class="panel panel-default" style="margin-bottom:1px"><div class="panel-heading">'+item.dateStr+'<button data-toggle="modal" data-ind="'+index+'" data-target="#event_modal" style="float:right" type="button" class="btn btn-primary btn-xs">+</button></div><div class="panel-body">';
		var items=item.events;
		if(items){
			var slots=[];
			for(var i=0;i<24*4;i++){
				slots[i]=false;
			}
			$.each( items, function( key, val ) {
				//console.log('inside event')
			   	var sx=val.event_time;
			   	var date=new Date(sx*1000);
			   	//console.log('sx=%s',sx);
			   	//console.log(val.json);
			   	var pd=JSON.parse(val.json);
			   	console.log('parsed item %o',pd);
			   	var description=pd.description;
			   	var color=pd.color;

			   	console.log('color=%s',color);
			   	var d=(sx-stamp)/(60*15);
			   	//console.log('d=%d',d);
			   	while(slots[d])
			   		d++;
			   	//slots[d]=true;		
		       //	var startY=d*100;
		       	
		       	//console.log(color.getCSSHexadecimalRGB());
		       	slots[d]='<div style="padding:5px;background-color:'+color+'">'+description+'</div>';
		    });
		    for(var i=0;i<24*4;i++){
				//var v=slots[i];
				var h=Math.floor(i/4);
				//var t=h+':'+((i-h*4)*15);
				//console.log(t);
				var date=new Date(1,1,1,h,(i-h*4)*15,0,0);
				var back="#FFDDDD";
				if(i/2==Math.floor(i/2))
					back='#DDDDDD';

				//console.log(d.toTimeString());
				var md=moment(i*15*60*1000);
				//console.log(md.format('h:mm a'));
				html+='<div class="row"><div style="padding:5px;background-color:'+back+'"  class="col-xs-4"><div>'+moment(date).format('h:mm a')+'</div></div><div class="col-xs-8">';
				if(!slots[i]){
					html+='</div></div>';
				}
				else{
					console.log('rendering event '+slots[i])
					html+=slots[i]+'</div></div>';	
				}
			}
		}
	}
	html+='</div>'; 
	//console.log(html);
	//#signup_modal
	return html;
}