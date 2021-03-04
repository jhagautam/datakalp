    var segments = [];
    var currentSelectedIndex = -1;
    var currentSelectedStart = -1;
    var currentSelectedEnd = -1;

    // Reset vars
    function reset() {
        currentSelectedIndex = -1;
        currentSelectedStart = -1;
        currentSelectedEnd = -1;

        $("#startSegmentInput").val(-1);
        $("#endSegmentInput").val(-1);
        $("#labelRadios1").prop("checked", true);
    }
    // Delete segment
    function removeSegment(start, end, index) {
        segments.splice(index, 1);
        $("li[data-start-frame='"+start+"'][data-end-frame='"+end+"']").remove();
        if (segments.length<1) {$("#label-list-help-text").show();}
    }
    // Select segment
    function selectSegment(start, end, index) {
        if (currentSelectedIndex==index) {return;}
        if (currentSelectedIndex!=-1) {
            $("li[data-start-frame='"+currentSelectedStart+"'][data-end-frame='"+currentSelectedEnd+"'] > a").removeClass("active");
        }
        currentSelectedIndex = index;
        currentSelectedStart = start;
        currentSelectedEnd = end;

        $("#startSegmentInput").val(start);
        $("#endSegmentInput").val(end);
        $('input[type="radio"][value="'+segments[index]["ActivityLabel"]+'"]').prop("checked", true);
        $("li[data-start-frame='"+start+"'][data-end-frame='"+end+"'] > a").addClass("active");

        updateSegmentHelperText("Segment "+start+":"+end+" selected!!", "info");
    }
    // Finalize segment
    function finalizeSegment() {
        player.pause();

        var currentStartFrame = parseInt($("#startSegmentInput").val(), 10);
        var currentEndFrame = parseInt($("#endSegmentInput").val(), 10);
        var selectedLabel = $('input[name="labelRadios"]:checked').val();

        // check value
        if (currentStartFrame==-1 || currentEndFrame==-1 || currentEndFrame - currentStartFrame<=0) {
            updateSegmentHelperText("Frame range is not correctly set. Please try again!!", "danger");
            return;
        }
        // check overlap
        for (i = 0; i<segments.length; i++) {
            if (currentSelectedIndex!=-1 && currentSelectedIndex==i) {
                continue; // skip this one
            }
            if ((currentStartFrame>=segments[i]['StartFrame'] && currentStartFrame<=segments[i]['EndFrame']) ||
            (currentEndFrame>=segments[i]['StartFrame'] && currentEndFrame<=segments[i]['EndFrame'])) {
                updateSegmentHelperText("Cannot create or edit segment because of overlapping segments. Retry!!", "danger");
                return;
            }
        }

        // editting selected segment
        if (currentSelectedIndex!=-1) {
            segments[currentSelectedIndex] = {
                "StartFrame": currentStartFrame,
                "EndFrame": currentEndFrame,
                "ActivityLabel": selectedLabel
            };

            $("li[data-start-frame='"+currentSelectedStart+"'][data-end-frame='"+currentSelectedEnd+"'] > a").removeClass("active");
            $("li[data-start-frame='"+currentSelectedStart+"'][data-end-frame='"+currentSelectedEnd+"']").attr("data-start-frame", currentStartFrame);
            $("li[data-start-frame='"+currentStartFrame+"'][data-end-frame='"+currentSelectedEnd+"']").attr("data-end-frame", currentEndFrame);
            $("li[data-start-frame='"+currentStartFrame+"'][data-end-frame='"+currentEndFrame+"'] > a > p > span.startSpan").text(currentStartFrame);
            $("li[data-start-frame='"+currentStartFrame+"'][data-end-frame='"+currentEndFrame+"'] > a > p > span.endSpan").text(currentEndFrame);
            $("li[data-start-frame='"+currentStartFrame+"'][data-end-frame='"+currentEndFrame+"'] > a > p > span.totalSpan").text(currentEndFrame-currentStartFrame+1);
            $("li[data-start-frame='"+currentStartFrame+"'][data-end-frame='"+currentEndFrame+"'] > a > span.labelSpan").text(selectedLabel);

            updateSegmentHelperText("Segment edited", "info");
        }
        // creating new segment
        else {
            segments.push({
                "StartFrame": currentStartFrame,
                "EndFrame": currentEndFrame,
                "ActivityLabel": selectedLabel
            });

            $("#label-list-help-text").hide();
            $("#label-list").append('<li class="nav-item" data-start-frame="'
                +currentStartFrame+'" data-end-frame="'+currentEndFrame+
                '"><a class="nav-link" data-toggle="tab" href="#"><p class="d-block">'
                +'<b>Frame:</b> <span class="startSpan">'+currentStartFrame+'</span> to <span class="endSpan">'+currentEndFrame+
                '</span><br><b>Total frames:</b> <span class="totalSpan">'+(currentEndFrame-currentStartFrame+1)+
                '</span></p><span class="badge badge-pill badge-warning labelSpan">'+selectedLabel+'</span></a></li>');

            updateSegmentHelperText("Added new segment!!", "success");
        }

        reset();
    }

    // Speed controlled frame seeking
    
    // Not working .....
    player.on('timeupdate', function() {
        var currentFrame = video.get();
        $("#currentFrameText").text(currentFrame);

        // Try to select segment only if player is paused
        if (player.paused()) {
            var foundStartFrame = -1;
            var foundEndFrame = -1;
            var index = -1;
            for (i = 0; i<segments.length; i++) {
                if (currentFrame>=segments[i]['StartFrame'] && currentFrame<=segments[i]['EndFrame']) {
                    foundStartFrame = segments[i]['StartFrame'];
                    foundEndFrame = segments[i]['EndFrame'];
                    index = i;
                    break;
                }
            }

            if(index!=-1) {
                selectSegment(foundStartFrame, foundEndFrame, index);
            }
        }
    });

    // Select segment by mouse click
    $("#label-list").click(function(event) {
        event.preventDefault();
        player.pause();

        var foundStartFrame = $(event.target).find("span.startSpan").text();
        var foundEndFrame = $(event.target).find("span.endSpan").text();
        var index = -1;
        for (i = 0; i<segments.length; i++) {
            if (foundStartFrame==segments[i]['StartFrame'] && foundEndFrame==segments[i]['EndFrame']) {
                index = i;
                break;
            }
        }
        if (index==-1) {
            console.log("Unexpected error occured!!"); return;
        }
        selectSegment(foundStartFrame, foundEndFrame, index);
    });

    player.on('ended', function() {
        //reset();
    });
    // Generate json
    $("#generateJsonButton").click(function () {
        var video_filename = $("#availableVideosSelect").val().replace(/\.[^/.]+$/, "");
        var username = $('#flask-data').attr('username');
        var userid = $('#flask-data').attr('userid')
        var current_datetime = new Date();
        var output_filename = "annotations_"+userid+"_"+username+"_"+video_filename+"_"+current_datetime.toDateString()+".json";

        var annotations = {
            "username": $('#flask-data').attr('username'),
            "video_filename": video_filename,
            "date_time": current_datetime,
            "labelling tool version": "v1.0",
            "annotations": segments
        }

        $("<a />", {
            "download": output_filename,
            "href" : "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(annotations)),
        }).appendTo("body").click(function() {
             $(this).remove();
        })[0].click();
    });
    // Complete reset
    $("#resetFullButton").click(function () {
        reset();
        segments.splice(0, segments.length);
        $("#label-list").empty();
        $("#label-list-help-text").show();
        updateSegmentHelperText("","none");
    });

    $(document).on('change', '#availableVideosSelect', function(e) {
        player.pause();
        selected_vid = "";

        // if (this.options[e.target.selectedIndex].text!="Example video") {
        //     selected_vid =  $('#flask-data').attr('vid_dir') + this.options[e.target.selectedIndex].value;
        // } else {
            selected_vid = this.options[e.target.selectedIndex].value;
        // }

        $("#videoSource").attr("src",selected_vid);

        player.src({
            src: selected_vid,
            type: 'video/mp4'
        });
        player.load();
        player.play();

        // change framerate
        var filename = this.options[e.target.selectedIndex].value;
        fetch(`${window.origin}/mediainfo`, {
            method : "POST",
            credentials : "include",
            body : JSON.stringify({
                "filename": filename
            }),
            cache : "no-cache",
            headers : new Headers({
                "content-type" : "application/json"
            })
        }).then(function(response) {
            if (response.status !== 200) {
                console.log(`Response status: ${response.status}`);
                return;
            }
            response.json().then(function(data) {
                video.frameRate =  data.video_fps;
                $("#fpsText").text(data.video_fps);
            });
        });
    });