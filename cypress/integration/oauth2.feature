Feature: Users should be able to add OAuth2 clients

  Scenario: User adds OAuth2 client
    Given the user visits the 'OAuth2 Clients' page
    And the user clicks on the 'Add OAuth2 client' button
    And the user enters the relevant details in the form that appears
    Then a snackbar message should appear telling the user that the client was saved
    And the page should show the new client in the table of clients

  Scenario: No OAuth2 clients are present
    Given the user visits the 'OAuth2 Clients' page
    And there are no OAuth2 clients
    Then the message 'There are currently no OAuth2 clients registered' should be shown

  Scenario: Some OAuth2 clients are present
    Given the user visits the 'OAuth2 Clients' page
    And there are some OAuth2 clients
    Then a table showing all clients should be present
