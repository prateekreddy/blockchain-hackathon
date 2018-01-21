var counter = 1;
var limit = 100;
var cens ;
function addInput(divName){
     if (counter == limit)  {
          alert("You have reached the limit of adding " + counter + " inputs");
     }
     else {
          var newdiv = document.createElement('div');
          newdiv.innerHTML = "Census Number " + (counter + 1) + " <br><input type='text' class='form-control' name='myInputs[]'>";
           document.getElementById(divName).appendChild(newdiv);
         cens = cens + document.getElementById(divName).value;
          counter++;
          console.log(cens)
          
     }
}


const requestFellPermit = () => {
    var ownername = document.getElementById('Owner').value ;
    
    var land_addr = document.getElementById('Land-address').value;
    var survey_no = document.getElementById('SurveyNo').value ;
    var khata_no = document.getElementById('KhataNo').value ;
    var census_no = [document.getElementById('census').value] ;
    var e = document.getElementById("conversion");
    var conversion_val = e.options[e.selectedIndex].value;
    console.log(ownername, land_addr, survey_no, khata_no, census_no, conversion_val, document.cookie);
    
    $.ajax({
        url:'http://127.0.0.1:8080/request/preFellPermit',
        type: 'post',
        data: JSON.stringify({
            "owner":ownername,
            "land_address":land_addr,
            "survey_no":survey_no,
            "khata_no":khata_no,
            "census_no":census_no,
            "covertion_type":conversion_val,
            "aadhar": document.cookie
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
                window.location="log.html";
               // $('#otp').html("OTP for customer is "+ data.OTP);
                //setTimeout( function(){swal("OTP has been sent to the user")}, 2000);
               
            }
        )
         .fail(function(xhr,textStatus,errorThrown){
            alert("Status: " + textStatus); alert("Error: " + errorThrown); 
         });
};