name: Bug report
description: Something's not playing right? Tell us what broke.
title: "[Bug] "
labels:
  - bug
assignees:
  - saraansx

body:
  - type: checkboxes
    attributes:
      label: Before you file this
      description: |
        Please search existing issues before opening a new one — open and closed.
        Duplicate reports slow everything down. Try a few different keywords.
      options:
        - label: I have searched existing issues and this has not been reported before
          required: true

  - type: textarea
    attributes:
      label: What went wrong
      description: Describe the broken behaviour clearly. What happened that shouldn't have?
      placeholder: |
        Lune crashed / froze / showed wrong data when I did...
    validations:
      required: true

  - type: textarea
    attributes:
      label: What should have happened
      description: What did you expect Lune to do instead?
      placeholder: |
        It should have played the track / opened the playlist / shown the lyrics...
    validations:
      required: true

  - type: textarea
    attributes:
      label: Steps to reproduce
      description: A clear reproduction path gets the bug fixed faster. Skip no steps.
      placeholder: |
        1. Open Lune
        2. Navigate to...
        3. Click...
        4. The following happened...
    validations:
      required: true

  - type: textarea
    attributes:
      label: Logs
      description: |
        Paste any relevant output here. Remove sensitive data before submitting.
        Open DevTools in Lune via the menu or Ctrl+Shift+I, then check the Console tab.
      value: |
        <details>
        <summary>Console output</summary>

        ```
        paste logs here
        ```
        </details>
    validations:
      required: true

  - type: input
    attributes:
      label: Lune version
      description: Which version of Lune are you on?
      placeholder: "e.g. 1.0.0"
    validations:
      required: true

  - type: input
    attributes:
      label: Operating system
      description: Which OS and version are you running Lune on?
      placeholder: "e.g. Windows 11 23H2, macOS 14.3, Ubuntu 22.04"
    validations:
      required: true

  - type: dropdown
    attributes:
      label: How did you install Lune?
      multiple: false
      options:
        - "GitHub Releases (installer)"
        - "WinGet"
        - "Scoop"
        - "Chocolatey"
        - "Built from source"
    validations:
      required: true

  - type: textarea
    attributes:
      label: Anything else
      description: Screenshots, screen recordings, or extra context that might help.
    validations:
      required: false

  - type: checkboxes
    attributes:
      label: Want to fix this yourself?
      description: |
        If you are a developer and want to take a shot at this, check the box below.
        PRs are always welcome — read CONTRIBUTING.md to get started.
      options:
        - label: I would like to work on this issue
          required: false
