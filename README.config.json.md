This is the config json object that this takes
 ```
    {      
        "user": "motion@somehost.com", 
        "email": {
            "host": "gmail.com",
            "port": 25,
            "auth": {
                "user": "login id",
                "pass": "password"
            }
        },
        "secure": {
           "tls": {
                "cyphers": "SSLv3"   
           }
        },
        "subject": "something something",
        "text": "message text something",
        "listenMessage": "string message",
        "listenPort": 8234,
        "changeModeKey": "some key",
        "replyMessage": "some other message key",
        "userLight": false 
    }
```    
The user field who you are sending the email to and from. This is usually going to be the same as email.auth.user.
This is because it currently expects the sending user to be the receiving user.  
The email.auth.pass is the email password.
The secure option allows passing options to the mail agent. 
The email.host and email.port are the host and port you are sending to and on.
