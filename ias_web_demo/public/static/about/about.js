const STATUS_CLICK_BUTTON = 0;
const STATUS_POST_APPLY = 1;

function getQueryBody(status) {
    const fields = ['contact', 'size', 'occupation', 'used', 'service']
    let body = `qb_user_name=${window.userInfo.UserAccount}&status=${status}`

    if (status === STATUS_POST_APPLY) {
        fields.forEach(field => body += `&${field}=${document.getElementById(field).value}`)
    }
    return body
}

function postTryout(status) {
    return fetch(`${window.API_ADDRESS}/tryout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: getQueryBody(status)
    }).then(res => res.ok && res.json())
}

function getQBUserInfo() {
    if (!window.cefQuery) return;

    window.cefQuery({
        request: JSON.stringify(['req_cache', [{ data: 'UserInfo' }]]),
        onSuccess: function(response) {
            window.userInfo = JSON.parse(response);
        },
        onFailure: function(code, msg) {
            console.log('与Quoteboard交互失败: ' + code + ': ' + msg);
        },
    });
}

function updateDialog() {
    document.getElementById('QBAccount').innerHTML = window.userInfo.UserAccount
}

function validatePhone(phone) {
    const mobile = /^((1[3-8][0-9])+\d{8})$/
    const guhua = /^(([0\+]\d{2,3}-)?(0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/

    return mobile.test(phone) || guhua.test(phone)
}

getQBUserInfo();

window.onload = function() {
    const tryout = document.getElementById('tryout');
    const confirm = document.getElementById('confirm')
    const cancel = document.getElementById('cancel')
    const contact = document.getElementById('contact');
    const error = document.getElementById('error');

    tryout.addEventListener('click', () => {
        postTryout(STATUS_CLICK_BUTTON)
        updateDialog()
    })

    confirm.addEventListener('click', (e) => {
        const r = validatePhone(contact.value)
        contact.style.border = r ? '1px solid #193D37' : '1px solid #D52222';
        error.style.display = r ? 'none' : 'inline-block';
        if (!r) {
            e.preventDefault();
            return;
        }
        postTryout(STATUS_POST_APPLY)
    })
}
