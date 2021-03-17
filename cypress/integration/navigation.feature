Feature: Users should be able to navigate between different sections

  Scenario: User clicks on every menu item on the sidebar
    Then each menu item leads them to the correct section
    And each section has a header that corresponds to the menu item name
