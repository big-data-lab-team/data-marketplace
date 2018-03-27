function loadMain() {
    getUser("main");
    getCategories("main");
    getData('');
}
function getCategories(page) {
    $.get("http://datacoin.iptvclient.com:3000/data/categories", function (data, status) {
        var arr = data.categories;
        if (data.status === '200') {
            if (page === "main") {
                var html = '';
                for (var i = 0; i < arr.length; i++) {
                    html += `<div class="custom-control custom-checkbox list-group-item list-group-item-action">
                <input type="checkbox" class="custom-control-input" id="${arr[i].id}">
                <label class="custom-control-label" for="${arr[i].id}">${arr[i].name}</label>
              </div>`;
                }
                $("#categories-list").html(html);
            } else if(page === "dashboard"){
                var html = '';
                for (var i = 0; i < arr.length; i++) {
                    html += `<option value="${arr[i].id}">${arr[i].name}</option>`;
                }
                $("#categories-list").html(html);
            }

        }


    });
}

function getData(filters) {
    $.get("http://datacoin.iptvclient.com:3000/data", function (data, status) {
        var arr = data.data;
        if (data.status === '200') {
            var html = '';
            for (var i = 0; i < arr.length; i++) {
                html += `<a class="list-group-item list-group-item-action" id="${arr[i].id}" onclick="showData(this.id)" data-toggle="modal" data-target="#details-modal" role="tab"
                aria>${arr[i].name} <stong>(${arr[i].price}$)</strong></a>`;
            }
        }
        $("#data-list").html(html);
    });
}

function showData(id) {
    var filters = {};
    filters['data-id'] = `${id}`;
    $.ajax({
        url: 'http://datacoin.iptvclient.com:3000/data',
        type: 'get',
        dataType: 'json',
        headers: {
            'x-data-filters': JSON.stringify(filters)
        },
        success: function (data) {
            var currData = data.data[0];
            var body = `<div class="card text-center">
    <div class="card-title" id="card-title">
        <!-- Alert -->
    </div>
    <div class="card-body">
        <form id="data-form" name="dataForm">
            <div class="form-group">
                <div class="input-group">
                <strong><span class="label label-primary" id="dataName">${currData.name}</span></strong>
                </div>
            </div>
            <div class="form-group">
                <div class="input-group">
                <span class="label label-primary" id="dataName">${currData.price}$</span>
                 </div>
            </div>
            <div role="separator" class="dropdown-divider"></div>
            <h3>Tags:</h3>
            <input id="tagsCounter" name="tagsCounter" type="hidden" value = "0" hidden>
            <div role="separator" class="dropdown-divider"></div>
            <div class="form-group" id="tags">
            </div>
        </form></div></div>`;
            $('.data-modal-body').html(body);
            if (currData.tags.length === 0) {
                $('#tags').append(`<div class="form-group">
        <div class="input-group">
        <span class="label label-primary" id="dataName">None</span>
        </div></div>`);
            } else {
                for (var i = 0; i < currData.tags.length; i++) {
                    $('#tags').append(`<div class="form-group"><div class="input-group">
                    <strong><span class="label label-primary" id="name-${i + 1}" name="name" type="text"placeholder="Tag Name" required>${currData.tags[i].name}</span></strong>
                    </div></div><div class="form-group"><div class="input-group">
                    <span class="label label-primary" id="value-${i + 1}" name="value"  type="text" placeholder="Tag value" required>${currData.tags[i].value}</span>
                    </div></div></div>`);
                }
                $("#tagsCounter").val(`${currData.tags.length + 1}`);
            }
            $('#requestButton').val(`${id}`);
            $('#details-modal').modal('show');
        },
        error: function (data) {
            $('#details-modal').modal('show');
            $('#card-title').html(`<div class="alert alert-danger">
        <strong>Error(${data.responseJSON['status']})!</strong> ${data.responseJSON['message']}.
      </div>`);
        }
    });
}

function requestData(dataId) {
    if (sessionStorage.getItem('x-api-key') === undefined
        || sessionStorage.getItem('x-api-key') === null
        || sessionStorage.getItem('x-api-key') === "undefined"
        || sessionStorage.getItem('x-api-key') === '') {
        $('#details-modal').modal('hide');
        $('#login-modal').modal('show');
        $('#alert-span').html(`<div class="alert alert-danger">
            <strong>Required!</strong> Please login in order to send a request.</div>`);
    }
    else {
        $.ajax({
            url: 'http://datacoin.iptvclient.com:3000/transactions',
            type: 'POST',
            dataType: 'json',
            headers: {
                "x-api-key": `${sessionStorage.getItem('x-api-key')}`,
                "Content-Type": "application/json"
            },
            data: `{"data_id":${dataId}}`,
            processData: false,
            success: function (data) {
                if (data.status === '201') {
                    $('#card-title').html(`<div class="alert alert-success">
                    <strong>Success!</strong> ${data.message}<br/>You can track it in the <a href="dashboard.html">dashboard</a> using the Requests Sent tab</div>`);
                    $('#login-modal').modal('hide');
                }
            },
            error: function (data) {
                $('#card-title').html(`<div class="alert alert-danger">
        <strong>Error(${data.responseJSON['status']})!</strong> ${data.responseJSON['message']}.
      </div>`);
            }
        });
    }
}

function login(user, pass) {
    if (user === '' || pass === '') {
        $('#alert-span').html(`<div class="alert alert-danger">
            <strong>Required!</strong> Please fill up the form correctly.
          </div>`);
    }
    else {
        $.ajax({
            url: 'http://datacoin.iptvclient.com:3000/user/auth',
            type: 'post',
            dataType: 'json',
            contentType: 'application/json',
            data: `{"username":"${user}","password":"${pass}"}`,
            processData: false,
            success: function (data) {
                if (data.status === '200') {
                    sessionStorage.setItem('x-api-key', data['x-api-key']);
                    $('#account-dropdown').html(`<a class="dropdown-item" href="dashboard.html">Dashboard</a>
                                            <a class="dropdown-item" href="" onclick="logout()">Logout</a>`);
                    $('#login-modal').modal('hide');
                }
            },
            error: function (data) {
                if (data.responseJSON['status'] === '422') {
                    $('#alert-span').html(`  <div class="alert alert-danger">
            <strong>Error(${data.responseJSON['status']})!</strong> <a href="activate.html">${data.responseJSON['message']}.
          </a></div>`);
                } else {
                    $('#alert-span').html(`  <div class="alert alert-danger">
            <strong>Error(${data.responseJSON['status']})!</strong> ${data.responseJSON['message']}.
          </div>`);
                }

            }
        });
    }
}//Done

function signup(user, pass, email, country, province, city, year) {
    $.ajax({
        url: 'http://datacoin.iptvclient.com:3000/user',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        data: `{"username":"${user}", "password":"${pass}", "email":"${email}","country":"${country}","province":"${province}","city":"${city}","yearOfBirth":${year}}`,
        processData: false,
        success: function (data) {
            if (data.status === '201') {
                $("#card-title").html(`<div class="alert alert-success">
                <strong>Success!</strong> User created successfully, Check your email for validation key<br/>
                and click <a href="activate.html">here</a> to activate.
              </div>`);
            }
        },
        error: function (data) {
            $('#card-title').html(`<div class="alert alert-danger">
        <strong>Error(${data.responseJSON['status']})!</strong> ${data.responseJSON['message']}.
      </div>`);
        }
    });
}//Done

function loadDashboard() {
    getUser("dashboard");
}//Done

function getUser(page) {
    $.ajax({
        url: "http://datacoin.iptvclient.com:3000/user",
        type: "GET",
        headers: {
            "x-api-key": `${sessionStorage.getItem('x-api-key')}`,
            "Content-Type": "text/plain"
        },
        success: function (data) {
            //continues loading dashboard
            $('#account-dropdown').html(`<a class="dropdown-item" href="dashboard.html">Dashboard</a>
                                            <a class="dropdown-item" href="" onclick="logout()">Logout</a>`);
            $('#login-modal').modal('hide');
            sessionStorage.setItem('owner-uuid', `${data.user.uuid}`);
            if (page === "dashboard") {
                $('#dash-content').html(`
        <div class="card text-center">
            <div class="card-header">
                <h3>Edit account</h3>
            </div>
            <div class="card-title p-3" id="card-title">
                <!-- Alert -->
            </div>
            <div class="card-body">
                <form id="edit-form" name="editAccountForm">
                    <div class="form-group">
                        <div class="input-group">
                            <input class="form-control" name="username" value="${data.user.username}" type="text" placeholder="Username" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="input-group">
                            <input class="form-control" name="password" type="password" placeholder="Password" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="input-group">
                            <input class="form-control" name="email" value="${data.user.email}" type="email" placeholder="Email" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="input-group">
                            <select class="form-control" name="country" value="${data.user.country}" >
                                <option value="Canada">Canada</option>
                                <option value="United States">United States</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="input-group">
                            <input class="form-control" name="province" value="${data.user.province}" type="text" placeholder="Province/State" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="input-group">
                            <input class="form-control" name="city" value="${data.user.city}" type="text" placeholder="City" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <select class="form-control" name="yearOfBirth" value="${data.user.yearOfBirth}" >
                            <option value="1970">1970</option>
                            <option value="1971">1971</option>
                            <option value="1972">1972</option>
                            <option value="1973">1973</option>
                            <option value="1974">1974</option>
                            <option value="1975">1975</option>
                            <option value="1976">1976</option>
                            <option value="1977">1977</option>
                            <option value="1978">1978</option>
                            <option value="1979">1979</option>
                            <option value="1980">1980</option>
                            <option value="1981">1981</option>
                            <option value="1982">1982</option>
                            <option value="1983">1983</option>
                            <option value="1984">1984</option>
                            <option value="1985">1985</option>
                            <option value="1986">1986</option>
                            <option value="1987">1987</option>
                            <option value="1988">1988</option>
                            <option value="1989">1989</option>
                            <option value="1990">1990</option>
                            <option value="1991">1991</option>
                            <option value="1992">1992</option>
                            <option value="1993">1993</option>
                            <option value="1994">1994</option>
                            <option value="1995">1995</option>
                            <option value="1996">1996</option>
                            <option value="1997">1997</option>
                            <option value="1998">1998</option>
                            <option value="1999">1999</option>
                            <option value="2000">2000</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" type="button" onclick="updateUser(editAccountForm.username.value, 
                        editAccountForm.password.value, 
                        editAccountForm.email.value, 
                        editAccountForm.country.value, 
                        editAccountForm.province.value,
                        editAccountForm.city.value,
                        editAccountForm.yearOfBirth.value)">Update</button>
                </form>

            </div>
            <div class="card-footer text-muted">
            </div>
    </div>`);
            }
        },
        error: function (data) {
            if (page === "dashboard") {
                $('#login-modal').modal('show');
                $('#alert-span').html(`<div class="alert alert-warning"><strong>Required!</strong> Please login.</div>`);
                window.location.assign("index.html")
            }
        }
    });
}//Done

function updateUser(user, pass, email, country, province, city, year) {
    $.ajax({
        url: 'http://datacoin.iptvclient.com:3000/user',
        type: 'put',
        dataType: 'json',
        headers: {
            'x-api-key': sessionStorage.getItem('x-api-key'),
            'Content-Type': 'application/json'
        },
        data: `{"username":"${user}","password":"${pass}","email":"${email}","country":"${country}","province":"${province}","city":"${city}","yearOfBirth":${year}}`,
        processData: false,
        success: function (data) {
            if (data.status === '200') {
                $("#card-title").html(`<div class="alert alert-success">
                <strong>Success!</strong> User updated successfully<br/>
              </div>`);
            }
            window.location.assign('dashboard.html');
        },
        error: function (data) {
            $('#card-title').html(`<div class="alert alert-danger">
        <strong>Error(${data.responseJSON['status']})!</strong> ${data.responseJSON['message']}.
      </div>`);
        }
    });
}//Done

function logout() {
    $.ajax({
        url: 'http://datacoin.iptvclient.com:3000/user/logout',
        type: 'get',
        dataType: 'json',
        headers: {
            'x-api-key': sessionStorage.getItem('x-api-key')
        },
        success: function (data) {
            if (data.status === '200') {
                window.location.assign("index.html")
            }
        },
        error: function (data) {
            window.location.assign("index.html")
        }
    });
    sessionStorage.removeItem('x-api-key');
    sessionStorage.removeItem('owner-uuid');
}//Done

function activate(email, key) {
    $.ajax({
        url: 'http://datacoin.iptvclient.com:3000/user/validate',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        data: `{"email":"${email}", "validationKey":"${key}"}`,
        processData: false,
        success: function (data) {
            if (data.status === '200') {
                $("#card-title").html(`<div class="alert alert-success">
                <strong>Success!</strong> Account activated<br/>
                and click <a href="index.html">here</a> to go Home.
              </div>`);
            }
        },
        error: function (data) {
            $('#card-title').html(`<div class="alert alert-danger">
        <strong>Error(${data.responseJSON['status']})!</strong> ${data.responseJSON['message']}.
      </div>`);
        }
    });
}//Done

function requestValidationKey(username, password) {
    if (username !== '' && username !== undefined && password !== '' && password !== undefined) {
        $.ajax({
            url: "http://datacoin.iptvclient.com:3000/user/validate",
            type: "POST",
            dataType: 'json',
            headers: {
                "Content-Type": "application/json"
            },
            data: `{"username":"${username}", "password":"${password}"}`,
            processData: false,
            success: function (data) {
                if (data.status === '200') {
                    $("#validation-alert-span").html(`<div class="alert alert-success">
                <strong>Success!</strong> ${data.message}
              </div>`);
                }
            },
            error: function (data) {
                $('#validation-alert-span').html(`<div class="alert alert-danger">
        <strong>Error(${data.responseJSON['status']})!</strong> ${data.responseJSON['message']}.
      </div>`);
            }
        });
    }
    else {
        $('#card-title').html(`<div class="alert alert-danger">
        <strong>Required!</strong> Enter your email first then click on Request a new one</div>`);
    }

}//Done

function getEditAccount() {
    getUser("dashboard");
}//Done

function getMyData() {
    var uid = sessionStorage.getItem('owner-uuid');
    var filters = {};
    filters['owner-uuid'] = sessionStorage.getItem('owner-uuid');

    if (uid !== undefined && uid !== '') {
        $.ajax({
            url: 'http://datacoin.iptvclient.com:3000/data',
            type: 'get',
            dataType: 'json',
            headers: {
                'x-api-key': sessionStorage.getItem('x-api-key'),
                'x-data-filters': JSON.stringify(filters)
            },
            success: function (data) {
                if (data.status === '200') {
                    if (data['data'].length === 0) {
                        $('#dash-content').html(`<div class="alert alert-info">
                    <strong>Empty!</strong> You have not listed any data yet. 
                    <br/>Start listing today! Use Sell Data tab.
                  </div>`);
                    }
                    else {
                        $('#dash-content').html("");
                        var arr = data['data'];
                        for (var i = 0; i < arr.length; i++) {
                            $('#dash-content').append(`
                            <div>
                            <a class="list-group-item list-group-item-action" id="${arr[i].id}" name='${JSON.stringify(arr[i])}' onclick="showDataDetails(this.id)" role="tab"
                aria>${arr[i].name} <stong>(${arr[i].price}$)</strong></a></div>`);
                        }
                    };
                }
            },
            error: function (data) {
                alert(JSON.stringify(data));
            }
        });
    } else {
        //alert failure
    }
}//Done

//Called In dashboard
function showDataDetails(id) {
    var data = JSON.parse($(`#${id}`).attr('name'));
    $("#updateButton").val(id);
    var body = `<div class="card text-center">
    <div class="card-title p-3" id="card-title">
        <!-- Alert -->
    </div>
    <div class="card-body">
        <form id="data-form" name="dataForm">
            <div class="form-group">
                <div class="input-group">
                    <input class="form-control" name="dataName" type="text" value = "${data.name}" placeholder="Data Name" required>
                </div>
            </div>
            <div class="form-group">
                <div class="input-group">
                    <input class="form-control" name="price" value = "${data.price}" type="number" placeholder="Price" required>
                </div>
            </div>
            <select class="form-control" name="categories" id="categories-list"></select>
            <div role="separator" class="dropdown-divider"></div>
            <h3>Tags:</h3>
            <input id="tagsCounter" name="tagsCounter" type="hidden" value = "0" hidden>
            <div role="separator" class="dropdown-divider"></div>
            
            <button class="btn btn-primary" type="button" onclick="addTag()">Add a new tag</button>
            <div class="form-group" id="tags">
            </div>
        </form></div>`;
    $('.data-modal-body').html(body);
    getCategories("dashboard");
    for (var i = 0; i < data.tags.length; i++) {
        $('#tags').append(`<div id="tags-group-${i+1}">
        <div class="form-group" >
          <div class="input-group">
              <input class="form-control" id="name-${i+1}" value="${data.tags[i].name}" type="text" placeholder="Tag Name" required>
          </div>
        </div>
        <div class="form-group">
          <div class="input-group">
              <input class="form-control" id="value-${i+1}" value="${data.tags[i].value}" type="text" placeholder="Tag value" required>
          </div>
        </div>
              <button class="btn btn-danger" name="removeTagButton" value="${i+1}" type="button" onclick="removeTag(this.value)">Remove</button>
      </div>`);
    }
    $('#details-modal').modal('show');
    $(function(){
        $('#categories-list').val(`${parseInt(data.categoryid)}`).change();
        $("#tagsCounter").val(data.tags.length);
    });
    

}

function getSellData() {
    $('#dash-content').html(`<div class="card text-center">
        <div class="card-header">
            <h3>Data Listing</h3>
        </div>
        <div class="card-title p-3" id="card-title">
            <!-- Alert -->
        </div>
        <div class="card-body">
            <form id="data-form" name="dataForm">
                <div class="form-group">
                    <div class="input-group">
                        <input class="form-control" id="data-name" name="dataName" type="text" placeholder="Data Name" required>
                    </div>
                </div>
                <div class="form-group">
                    <div class="input-group">
                        <input class="form-control" id="data-price" name="price" type="number" placeholder="Price" required>
                    </div>
                </div>
                <select class="form-control" name="categories" id="categories-list"></select>
                
                <div role="separator" class="dropdown-divider"></div>
                <h3>Tags:</h3>
                <input id="tagsCounter" name="tagsCounter" type="hidden" value = "1" hidden>
                <div role="separator" class="dropdown-divider"></div>
                <div><button class="btn btn-primary" type="button" onclick="addTag()">Add a new tag</button></div>
                <div class="form-group" id="tags">

                <div id="tags-group-1">
                          <div class="form-group" >
                            <div class="input-group">
                                <input class="form-control" id="name-1" name="name" type="text" placeholder="Tag Name" required>
                            </div>
                          </div>
                          <div class="form-group">
                            <div class="input-group">
                                <input class="form-control" id="value-1" name="value" type="text" placeholder="Tag value" required>
                            </div>
                          </div>
                                <button class="btn btn-danger" name="removeTagButton" value="1" type="button" onclick="removeTag(this.value)">Remove</button>
                        </div>
                </form>

        </div>
        <div class="card-footer text-muted">
        <button class="btn btn-primary" type="button" onclick="listData()">Add Data</button>
        </div>
    </div>`);
    $(function(){
        getCategories("dashboard");
    });
}//Done

function listData() {
    var name = $("#data-name").val();
    var price = $("#data-price").val();
    //Get Tags 
    var tags = [];
    var i = parseInt($("#tagsCounter").val());
    var increment = 1;
    while (increment <= i) {
        tags.push(`{"key":"${$(`#name-${increment}`).val()}", "value":"${$(`#value-${increment}`).val()}"}`);
        increment++;
    }
    var d = `{"name":"${name}", "price":${price}, "categoryid": ${$("#categories-list option:selected").val()}, "tags":[${tags}]}`;
    //Post Data to the server
    $.ajax({
        url: 'http://datacoin.iptvclient.com:3000/data',
        type: 'post',
        dataType: 'json',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': sessionStorage.getItem('x-api-key')
        },
        data: d,
        processData: false,
        success: function (data) {
            if (data.status === '201') {
                $("#card-title").html(`<div class="alert alert-success">
                <strong>Success!</strong> Data listed successfully.<br/>
                You can browse it using My Data tab.
              </div>`);
            }
        },
        error: function (data) {
            $('#card-title').html(`<div class="alert alert-danger">
        <strong>Error(${data.responseJSON['status']})!</strong> ${data.responseJSON['message']}.
      </div>`);
        }
    });

}//Done

function updateData(){
    //Get Tags 
    var tags = [];
    var i = parseInt($("#tagsCounter").val());
    alert(i);
    var increment = 1;
    var categoryid = $("#categories-list").val();
    while (increment <= i) {
        tags.push(`{"key":"${$(`#name-${increment}`).val()}", "value":"${$(`#value-${increment}`).val()}"}`);
        increment++;
    }
    //Post Data to the server
    $.ajax({
        url: 'http://datacoin.iptvclient.com:3000/data',
        type: 'post',
        dataType: 'json',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': sessionStorage.getItem('x-api-key')
        },
        data: `{"name":"${name}", "price":"${price}", "categoryid": ${categoryid}, "tags":[${tags}]}`,
        processData: false,
        success: function (data) {
            if (data.status === '201') {
                $("#card-title").html(`<div class="alert alert-success">
                <strong>Success!</strong> Data listed successfully.<br/>
                You can browse it using My Data tab.
              </div>`);
            }
        },
        error: function (data) {
            $('#card-title').html(`<div class="alert alert-danger">
        <strong>Error(${data.responseJSON['status']})!</strong> ${data.responseJSON['message']}.
      </div>`);
        }
    });

}

function addTag() {
    var i = parseInt($("#tagsCounter").val());
    $("#tagsCounter").val(i + 1);
    $('#tags').append(`<div id="tags-group-${i+1}">
                          <div class="form-group" >
                            <div class="input-group">
                                <input class="form-control" id="name-${i+1}" name="name" type="text" placeholder="Tag Name" required>
                            </div>
                          </div>
                          <div class="form-group">
                            <div class="input-group">
                                <input class="form-control" id="value-${i+1}" name="value" type="text" placeholder="Tag value" required>
                            </div>
                          </div>
                                <button class="btn btn-danger" name="removeTagButton" value="${i+1}" type="button" onclick="removeTag(this.value)">Remove</button>
                        </div>`);
}//Done

function removeTag(tagId){
    //$(`#name-${tagId}`).remove();
    //$(`#value-${tagId}`).remove();
    $("#tagsCounter").val($("#tagsCounter").val()-1);
    $(`div[id="tags-group-${tagId}"]`).remove();
}

function getInRequests() {
    $.ajax({
        url: 'http://datacoin.iptvclient.com:3000/transactions',
        type: 'get',
        dataType: 'json',
        headers: {
            'x-api-key': sessionStorage.getItem('x-api-key'),
            'x-tx-filters': `{"receiver_uuid":"${sessionStorage.getItem('owner-uuid')}"}`
        },
        success: function (data) {
            //alert(JSON.stringify(data));
            if (data.status === '200') {
                if(data.transactions.length === 0){
                    $('#dash-content').html(`<div class="alert alert-info">
                    <strong>Empty!</strong> You have not listed any data yet. 
                    <br/>Start listing today! Use Sell Data tab.
                  </div>`);
                }
                else{
                    var html ='';
                    var arr = data.transactions;
                    for(var i=0; i<arr.length; i++){
                        if(arr[i].status === "Pending"){
                        html+=`<a class="list-group-item list-group-item-action" id="${arr[i].id}" onclick="showTransaction(this.id)" data-toggle="modal" data-target="#transactions-modal" role="tab"
                        aria><button type="button" class="btn btn-info">${arr[i].status}</button> Data: ${arr[i].data.name} | ${arr[i].data.price}$</a>`;
                        }
                        else{
                            html+=`<a class="list-group-item list-group-item-action" id="${arr[i].id}" onclick="showTransaction(this.id)" data-toggle="modal" data-target="#transactions-modal" role="tab"
                        aria>( ${arr[i].status} )</button> Data: ${arr[i].data.name} | ${arr[i].data.price}$</a>`;
                        
                        }
                    }
                }
            
                $("#dash-content").html(html);
            }
        },
        error: function (data) {
            $('#card-title').html(`<div class="alert alert-danger">
        <strong>Error(${data.responseJSON['status']})!</strong> ${data.responseJSON['message']}.
      </div>`);
        }
    });
}//Done

function getOutRequests() {
    $.ajax({
        url: 'http://datacoin.iptvclient.com:3000/transactions',
        type: 'get',
        dataType: 'json',
        headers: {
            'x-api-key': sessionStorage.getItem('x-api-key'),
            'x-tx-filters': `{"requester_uuid":"${sessionStorage.getItem('owner-uuid')}"}`
        },
        success: function (data) {
            //alert(JSON.stringify(data));
            if (data.status === '200') {
                if(data.transactions.length === 0){
                    $('#dash-content').html(`<div class="alert alert-info">
                    <strong>Empty!</strong> You have not listed any data yet. 
                    <br/>Start listing today! Use Sell Data tab.
                  </div>`);
                }
                else{
                    var html ='';
                    var arr = data.transactions;
                    for(var i=0; i<arr.length; i++){
                        if(arr[i].status === "Sample uploaded"){
                        html+=`<a class="list-group-item list-group-item-action" id="${arr[i].id}" onclick="showTransaction(this.id)" data-toggle="modal" data-target="#transactions-modal" role="tab"
                        aria><button type="button" class="btn btn-info">${arr[i].status}</button> Data: ${arr[i].data.name} | ${arr[i].data.price}$</a>`;
                        }
                        else{
                            html+=`<a class="list-group-item list-group-item-action" id="${arr[i].id}" onclick="showTransaction(this.id)" data-toggle="modal" data-target="#transactions-modal" role="tab"
                        aria>( ${arr[i].status} )</button> Data: ${arr[i].data.name} | ${arr[i].data.price}$</a>`;
                         
                        }
                    }
                }
            
                $("#dash-content").html(html);
            }
        },
        error: function (data) {
            $('#card-title').html(`<div class="alert alert-danger">
        <strong>Error(${data.responseJSON['status']})!</strong> ${data.responseJSON['message']}.
      </div>`);
        }
    });
}//Done

function showTransaction(id) {
    $.ajax({
        url: 'http://datacoin.iptvclient.com:3000/transactions',
        type: 'get',
        dataType: 'json',
        headers: {
            'x-api-key': sessionStorage.getItem('x-api-key'),
            'x-tx-filters': `{"tx_id":${id}}`
        },
        success: function (data) {
            //alert(JSON.stringify(data));
            if (data.status === '200') {
                if(data.transactions.length === 0){
                    $('#dash-content').html(`<div class="alert alert-info">
                    <strong>Empty!</strong> Transaction not found.
                  </div>`);
                }
                else{
                    var html ='';
                    var arr = data.transactions;
                    for(var i=0; i<arr.length; i++){
                        if(arr[i].status === "Sample uploaded"){
                        html+=`<a class="list-group-item list-group-item-action" id="${arr[i].id}" onclick="showTransaction(this.id)" data-toggle="modal" data-target="#transactions-modal" role="tab"
                        aria><button type="button" class="btn btn-info">${arr[i].status}</button> Data: ${arr[i].data.name} | ${arr[i].data.price}$</a>`;
                        }
                        else{
                            html+=`<a class="list-group-item list-group-item-action" id="${arr[i].id}" onclick="showTransaction(this.id)" data-toggle="modal" data-target="#transactions-modal" role="tab"
                        aria>( ${arr[i].status} )</button> Data: ${arr[i].data.name} | ${arr[i].data.price}$</a>`;
                         
                        }
                    }
                }
            
                $("#dash-content").html(html);
            }
        },
        error: function (data) {
            $('#card-title').html(`<div class="alert alert-danger">
        <strong>Error(${data.responseJSON['status']})!</strong> ${data.responseJSON['message']}.
      </div>`);
        }
    });
}

function updateStatus() {

}

/**
 * Get list of categories
 * Load all data available on the market
 * When user click data load data 
 * If he tries to make a request check login, if not popup modal to login
 * When logged in allo request data, send request and ALERT response (check dashboard)
 * 
 * 
 * IN dashboard a user can see his own lited data 
 * (getData(filter by owner api key)) show edit button popup modal
 * add new tag edit return alert
 * 
 *
 * 
 * list his own sent requests getTransactions(filter by requester API key)
 * in this list if status = ? show a button to update status to Data Validated
 * 
 * list his own received requests getTransactions(filter by owner API key)
 * in this list if status = pending show a button to accept or reject
 * 
 */