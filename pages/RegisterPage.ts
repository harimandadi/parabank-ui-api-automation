import { Locator, Page, test } from '@playwright/test';
import { BasePage } from './BasePage';

export type CustomerDetails = {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  ssn: string;
  username: string;
  password: string;
  confirmPassword: string;
};

/** Field ids on register.htm contain dots, so they're matched with [id="..."]. */
const byId = (page: Page, id: string): Locator => page.locator(`[id="${id}"]`);

export class RegisterPage extends BasePage {
  readonly heading: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly streetInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly zipCodeInput: Locator;
  readonly phoneInput: Locator;
  readonly ssnInput: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly registerButton: Locator;

  // Post-registration
  readonly welcomeHeading: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Signing up is easy!' });
    this.firstNameInput = byId(page, 'customer.firstName');
    this.lastNameInput = byId(page, 'customer.lastName');
    this.streetInput = byId(page, 'customer.address.street');
    this.cityInput = byId(page, 'customer.address.city');
    this.stateInput = byId(page, 'customer.address.state');
    this.zipCodeInput = byId(page, 'customer.address.zipCode');
    this.phoneInput = byId(page, 'customer.phoneNumber');
    this.ssnInput = byId(page, 'customer.ssn');
    this.usernameInput = byId(page, 'customer.username');
    this.passwordInput = byId(page, 'customer.password');
    this.confirmPasswordInput = byId(page, 'repeatedPassword');
    this.registerButton = page.locator('#customerForm input[type="submit"][value="Register"]');
    this.welcomeHeading = page.locator('#rightPanel h1.title');
    this.successMessage = page.locator('#rightPanel p');
  }

  async goto(): Promise<void> {
    await this.open('register.htm');
  }

  /** Error span next to a field, e.g. fieldError('customer.username'). */
  fieldError(fieldId: string): Locator {
    return byId(this.page, `${fieldId}.errors`);
  }

  async fillForm(c: CustomerDetails): Promise<void> {
    await this.firstNameInput.fill(c.firstName);
    await this.lastNameInput.fill(c.lastName);
    await this.streetInput.fill(c.street);
    await this.cityInput.fill(c.city);
    await this.stateInput.fill(c.state);
    await this.zipCodeInput.fill(c.zipCode);
    await this.phoneInput.fill(c.phone);
    await this.ssnInput.fill(c.ssn);
    await this.usernameInput.fill(c.username);
    await this.passwordInput.fill(c.password);
    await this.confirmPasswordInput.fill(c.confirmPassword);
  }

  async register(c: CustomerDetails): Promise<void> {
    await test.step(`Register user "${c.username}"`, async () => {
      await this.fillForm(c);
      await this.registerButton.click();
    });
  }
}
