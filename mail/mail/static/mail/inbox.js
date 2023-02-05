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



  // fetch and display emails based on mailbox
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      let email = document.querySelector('#emails-view')

      //create new element in inbox page
      for (let i = 0; i < emails.length; i++) {

        var link = document.createElement("li");
        link.setAttribute("data-email-id", `${emails[i].id}`)
        link.className = "list-group-item"
        link.href = "#"
        link.innerHTML = `<b>${emails[i].sender}</b> | ${emails[i].subject}      <span class="text-small">@${emails[i].timestamp}</span>`

        email.appendChild(link)

      }
      runListItemCode(emails);
    });
}

function runListItemCode(emails) {
  let listItems = document.querySelectorAll('li[data-email-id]');

  if (listItems.length === 0) {
    console.log('No list items');
  } else {
    listItems.forEach(function (listItem) {
      // on click of email from inbox
      listItem.addEventListener('click', function (event) {

        // display email card
        document.querySelector('#email-view-card').style.display = 'block'
        document.querySelector('#inbox-view-col').className = 'col-5'

        id = event.target.getAttribute('data-email-id')
        fetch(`/emails/${id}`)
          .then(response => response.json())
          .then(emails => {
            console.log(emails)
            fillEmailContent(emails)
          })
      });
    });
  }
}

function fillEmailContent(emails) {
  console.log(emails)

  // check if email is archived or not to change status of archive button
  if (emails.archived === true) {
    document.querySelector('#archive-email').innerHTML = "Unarchive"
  } else {
    document.querySelector('#archive-email').innerHTML = "Archive"
  }

  // fill in email reader view
  const subject = document.querySelector('#email-subject')
  subject.innerHTML = emails.subject

  const from = document.querySelector('#email-sender')
  from.innerHTML = emails.sender

  const body = document.querySelector('#email-body')
  body.innerHTML = emails.body

  const recipient = document.querySelector('#email-recipient')
  recipient.innerHTML = emails.recipients

  document.querySelector('#close-email').addEventListener('click', () => {
    document.querySelector('#email-view-card').style.display = 'none'
    let test = document.querySelector('#inbox-view-col').className = "col-12"
  })

  document.querySelector('#reply-email').addEventListener('click', () => {
    reply_email(emails)
  })

  // archive/unarchive function
  document.querySelector('#archive-email').addEventListener('click', () => {

    console.log(emails.archived)
    if (emails.archived == false) {
      // archive email
      fetch(`/emails/${emails.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: true
        })
      })
    } else {
      // unarchive email
      fetch(`/emails/${emails.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: false
        })
      })
    }
  })
}

function reply_email(emails) {
  // On Jan 1 2020, 12:00 AM foo@example.com wrote:

  // Show compose view and hide other views
  document.querySelector('#inbox-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';


  if (emails.subject.includes('Re:')) {
    console.log("contains RE")
    let reply_subject = emails.subject
  } else {
    reply_subject = `Re: ${emails.subject}`
  }

  let reply_body = `On ${emails.timestamp} ${emails.sender} wrote: \n"${emails.body}"\n`

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = `${emails.sender}`;
  document.querySelector('#compose-subject').value = `${reply_subject}`;
  document.querySelector('#compose-body').value = `${reply_body}\n`;
}