const register = () => {
    $("#aadhar").prop('readonly', true);
    $("#registerForm").show();
    $("#otpModal").hide();
    $.ajax({
        url:'http://127.0.0.1:8080/login',
        type: 'post',
        data: JSON.stringify({
            "aadhar": $('#aadhar').val()
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
                document.cookie = $('#aadhar').val()
                window.location="log.html";
               // $('#otp').html("OTP for customer is "+ data.OTP);
                //setTimeout( function(){swal("OTP has been sent to the user")}, 2000);
               
            }
        )
         .fail(function(xhr,textStatus,errorThrown){
            alert("Status: " + textStatus); alert("Error: " + errorThrown); 
         });
};