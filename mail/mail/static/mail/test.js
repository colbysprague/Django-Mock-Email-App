document.addEventListener('DOMContentLoaded', function () {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    document.querySelector('#compose-form').onsubmit = () => {
        // code to be executed when form is submitted
        const recipients = document.querySelector('#compose-recipients').value;
        const subject = document.querySelector('#compose-subject').value;
        const body = document.querySelector('#compose-body').value;

        // send the email using cs50 API
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: recipients,
                subject: subject,
                body: body
            })
        })
            .then(response => response.json())
            .then(result => {
                console.log(result)
                // redirect to inbox
                load_mailbox('inbox')
            });

        return false;
    };

    // By default, load the inbox
    load_mailbox('inbox');
});

function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#inbox-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    document.querySelector('#inbox-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-view-card').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    if (mailbox == 'archive') {
        document.querySelector('#archive-email').innerHTML = 'Unarchive'
    }

    // fetch and display emails based on mailbox
    fetch(`/emails/${mailbox}`)
        .then(response => response.json())
        .then(emails => {


            //create new element in inbox page
            for (let i = 0; i < emails.length; i++) {

                console.log(emails[i])
                var link = document.createElement("li");
                link.setAttribute("data-email-id", `${emails[i].id}`)
                link.className = "list-group-item"

                link.href = "#" //`email_view/${email_id}`
                link.innerHTML = `${emails[i].sender} | ${emails[i].subject}`


                // close email on click of close button
                document.querySelector('#close-email').addEventListener('click', () => {
                    document.querySelector('#email-view-card').style.display = 'none'
                })

                link.addEventListener('click', () => {

                    // display email reader view
                    document.querySelector('#email-view-card').style.display = 'block'

                    // mark email as read
                    fetch(`/emails/${emails[i].id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            read: true
                        })
                    })

                    // debug
                    console.log(`email ${emails[i].id} clicked on\n Subject: ${emails[i].subject}`)
                    console.log(emails[i].read)
                    console.log(emails[i].archived)

                    // fill in email reader view
                    const subject = document.querySelector('#email-subject')
                    subject.innerHTML = emails[i].subject

                    const from = document.querySelector('#email-sender')
                    from.innerHTML = emails[i].sender

                    const body = document.querySelector('#email-body')
                    body.innerHTML = emails[i].body

                    const recipient = document.querySelector('#email-recipient')
                    recipient.innerHTML = emails[i].recipients

                })

                var p = document.createElement("p");
                p.appendChild(link)

                var emailView = document.getElementById("emails-view");
                emailView.appendChild(p);
            }
        });
}
