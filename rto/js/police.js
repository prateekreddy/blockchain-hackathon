const getPermit = () => {
    
    $.ajax({
        url:'http://rto.southeastasia.cloudapp.azure.com/allpermits',
        type: 'post',
        data: JSON.stringify({
        
                "transportPermitId": "63811750-fe76-11e7-9003-591a85680273"
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
            //     var str;
            //   for (var index = 0; index < data.result.length; index++) {
            //       str += data.result[index].key
            //   }
            //    $('#rto').html(""+ str);
                
               // window.location="log.html";
                $('#rto').html("The granted Permits are\t \t"+ data.result[0].key+"\t\t\t"+data.result[1].key);
               
            }
        )
         .fail(function(xhr,textStatus,errorThrown){
            alert("Status: " + textStatus); alert("Error: " + errorThrown); 
         });
};