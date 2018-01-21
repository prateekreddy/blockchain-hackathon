const sawmill = () => {
    
    $.ajax({
        url:'http://rto.southeastasia.cloudapp.azure.com/logreport',
        type: 'post',
        data: JSON.stringify({
            "transportPermitId": "63811750-fe76-11e7-9003-591a85680273",
"sawmillname":"timberyard",
"stockreceived":"24",
"logsgenerated":"100"
        }),
        headers:{
            'Content-Type':'application/json'
        },
        dataType: 'json',
        crossDomain:true,
        xhrFields:{
            withCredentials:true
        }
        })
        .done (
            function(data){
    
                console.log(data)
               // window.location="log.html";
               swal(data.status)
                //$('#status').html(" "+ data.status);
                
               
            }
        )
         .fail(function(xhr,textStatus,errorThrown){
            alert("Status: " + textStatus); alert("Error: " + errorThrown); 
         });
};