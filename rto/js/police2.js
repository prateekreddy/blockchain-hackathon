const getPermitData = () => {
    
    $.ajax({
        url:'http://rto.southeastasia.cloudapp.azure.com/check',
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
                $('#treefellpermit').html(""+ data.treefellpermit);
                $('#sawmillname').html(""+ data.sawmillname);
                $('#fromaddress').html(""+ data.fromaddress);
                $('#sawmilladdress').html(""+ data.sawmilladdress);
                $('#vehiclenumber').html(""+ data.vehiclenumber);
                $('#quantity').html(""+ data.quantity);                
               
            }
        )
         .fail(function(xhr,textStatus,errorThrown){
            alert("Status: " + textStatus); alert("Error: " + errorThrown); 
         });
};