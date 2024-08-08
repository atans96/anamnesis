import { expect, test } from '@playwright/test';

test.describe('Anamnesis Form Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage before each test
    await page.goto('http://localhost:5173');
  });

  test('Create a new anamnesis form', async ({ page }) => {
    // Click on "Create Form" button
    await page.click('text=Add New Form');

    // Fill in the form details
    await page.fill('input[name="title"]', 'Test Anamnesis Form');
    await page.fill(
      'textarea[name="description"]',
      'This is a test form description'
    );

    // Add a section
    await page.click('text=Add Section');
    await page.fill(
      'input[placeholder="Add Your Title Section"]',
      'Test Section'
    );

    // Add a question
    await page.click('text=Add Question');
    await page.fill('input[placeholder="Question"]', 'What is your name?');
    await page.selectOption('select', 'short_text');

    // Submit the form
    await page.click('text=Create Form');

    // Check if we're redirected to the form list
    await expect(page).toHaveURL('http://localhost:5173');
  });

  test('Update an existing anamnesis form', async ({ page }) => {
    // Click on "Edit" for the first form
    await page.click('text=Edit >> nth=0');

    // Update the form title
    await page.fill('input[name="title"]', 'Updated Test Form');

    // Add a new section
    await page.click('text=Add Section');
    await page.fill(
      'input[placeholder="Add Your Title Section"] >> nth=1',
      'New Section'
    );

    // Add a new question to the new section
    await page.click('text=Add Question >> nth=1');
    await page.fill(
      'input[placeholder="Question"] >> nth=1',
      'What is your age?'
    );
    await page.selectOption('select >> nth=1', 'short_text');

    // Update the form
    await page.click('text=Update Form');

    // Check if we're redirected to the form list
    await expect(page).toHaveURL('http://localhost:5173');
  });

  test('View an anamnesis form', async ({ page }) => {
    // Click on "View" for the first form
    await page.click('text=View >> nth=0');
    await expect(page.locator('text=General Health Assessment')).toBeVisible();
  });

  test('Delete an anamnesis form', async ({ page }) => {
    const formTitle = 'Updated Test Form';

    // Navigate to the form list page and wait for it to load
    await page.goto('http://localhost:5173'); // Adjust this URL as needed
    await page.waitForSelector('table');

    // Get the initial count of forms
    const initialCount = await page.locator('tr').count();

    // Check if the form exists
    const formRow = page.locator(`tr:has-text("${formTitle}")`);

    if ((await formRow.count()) === 0) {
      return;
    }

    // Click on "Delete" for the form we created
    await formRow.locator('text=Delete').click();

    // Wait for and click the confirmation modal
    await page.waitForSelector('text=Confirm Deletion');
    await page.click('text=Delete');

    // Wait for the form to be removed from the list
    await page.waitForFunction(
      (title) => !document.body.textContent?.includes(title),
      formTitle
    );

    // Check if the form is removed from the list
    await expect(page.locator(`text="${formTitle}"`)).not.toBeVisible();

    // Check if the total count of forms has decreased
    const newCount = await page.locator('tr').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('Create a form with multiple choice questions', async ({ page }) => {
    // Click on "Create Form" button
    await page.click('text=Add New Form');

    // Fill in the form details
    await page.fill('input[name="title"]', 'Multiple Choice Form');
    await page.fill(
      'textarea[name="description"]',
      'Form with multiple choice questions'
    );

    // Add a section
    await page.click('text=Add Section');
    await page.fill(
      'input[placeholder="Add Your Title Section"]',
      'Multiple Choice Section'
    );

    // Add a multiple choice question
    await page.click('text=Add Question');
    await page.fill(
      'input[placeholder="Question"]',
      'Choose your favorite color'
    );
    await page.selectOption('select', 'multiple_choice');

    // Add choices
    await page.click('text=Add Choice');
    await page.fill('input[placeholder="Choice 1"]', 'Red');
    await page.click('text=Add Choice');
    await page.fill('input[placeholder="Choice 2"]', 'Blue');
    await page.click('text=Add Choice');
    await page.fill('input[placeholder="Choice 3"]', 'Green');

    // Submit the form
    await page.click('text=Create Form');

    // Wait for navigation to complete
    await page.waitForNavigation();

    // Check if we're redirected to the form list
    await expect(page).toHaveURL('http://localhost:5173');
  });
});
