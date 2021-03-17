Feature: Users should be able to modify settings

  Scenario: User modifies setting
    Given the user clicks on an input field for a setting
    And the user enters a new value
    And the user switches focus away from the input field
    Then a snackbar message appears telling the user that the new value was saved
    And on reloading the app the new value is still present

  Scenario: User enters invalid setting value
    Given the user clicks on an input field for a setting
    And the user enters an invalid value
    Then the input field becomes red
    And a validation error message is shown below the input
