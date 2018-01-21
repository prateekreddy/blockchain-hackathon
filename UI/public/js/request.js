$(".verify").click(function(){
    
    $.ajax({
    url:'http://tree.southeastasia.cloudapp.azure.com/getAddress',
    type: 'post',
    data: JSON.stringify({
        "name":"raksha",
        "key":"khdkj"
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
           // $('#otp').html("OTP for customer is "+ data.OTP);
            //setTimeout( function(){swal("OTP has been sent to the user")}, 2000);
           
        }
    )
     .fail(function(xhr,textStatus,errorThrown){
        alert("Status: " + textStatus); alert("Error: " + errorThrown); 
     });
    });