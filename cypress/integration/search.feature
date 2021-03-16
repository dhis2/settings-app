Feature: Users should be able to search for settings

  Scenario: User searches for a setting
    Given the user clicks on the search input
    And the user enters <search term>
    Then the user is shown search results for settings whose names match <search term>

  Scenario: User searches for a setting that does not exist
    Given the user clicks on the search input
    And the user enters a search term for a setting that does not exist
    Then the user is shown the message "No settings matched the search term"

  Scenario: User clears search input
    Given the user clicks on the search input
    And the user enters a search term
    And the user clicks the clear input button
    Then the value of the search input should be cleared
    And search results should be replaced with the last tab the user was on
