import { HydrationPage } from './app.po';

describe('hydration App', function() {
  let page: HydrationPage;

  beforeEach(() => {
    page = new HydrationPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
