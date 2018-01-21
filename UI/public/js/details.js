const makeTable = function(data, idName) {
    var tbl_body = "";
    var odd_even = false;
    $.each(data, function() {
        var tbl_row = "";
        $.each(this, function(k , v) {
            tbl_row += "<td style='width: 100px' id='"+k+"'>"+v+"</td>";
        })
        tbl_row += "<td id='transportId'><button class='btn btn-success' onclick='requestTransport()'>Request Travel Permit</button></td>";
        tbl_body += "<tr class=\""+( odd_even ? "odd" : "even")+"\" id='request1'>"+tbl_row+"</tr>";
        odd_even = !odd_even;               
    })
    $("#"+idName).append(tbl_body);
};

const requestTransport = () => {
    $.ajax({
        url:'http://127.0.0.1:8080/transportRequest',
        type: 'post',
        data: JSON.stringify({
            "treefellpermit": $('#permitId').value,
            "sawmillanme":"TimberMill",
            "fromaddress":"bangalore",
            "sawmilladdress":"chennai",
            "vehiclenumber":"ka12h8768",
            "quantity":"24"
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
                $('#transportId').html(data.transportPermitId);
                alert("Travel permit request is "+data.transportPermitId);
               // window.location="log.html";
               // $('#otp').html("OTP for customer is "+ data.OTP);
                //setTimeout( function(){swal("OTP has been sent to the user")}, 2000);
               
            }
        )
        .fail(function(xhr,textStatus,errorThrown){
            alert("Status: " + textStatus); alert("Error: " + errorThrown); 
        });
}

const getAllData = () => {
    $.ajax({
        url:'http://127.0.0.1:8080/request/getAllPermits',
        type: 'post',
        data: JSON.stringify({
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
                
                makeTable(data, "request");
               // $('#otp').html("OTP for customer is "+ data.OTP);
                //setTimeout( function(){swal("OTP has been sent to the user")}, 2000);
               
            }
        )
         .fail(function(xhr,textStatus,errorThrown){
            alert("Status: " + textStatus); alert("Error: " + errorThrown); 
         });
};