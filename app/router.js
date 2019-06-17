import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import Route from '@ember/routing/route'

const Router = EmberRouter.extend({
    location: config.locationType,
    rootURL: config.rootURL
});

Route.reopen({
    showNav: true,
    setupController() {
        this._super(...arguments);
        this.controllerFor('application').set('showNavbar', this.get('showNav'));
    }
})

Router.map(function () {
  this.route('page-login', { path: 'login' });
  this.route('oauth-callback');
  this.route('page-result', { path: 'result' }, function () {
    this.route('review');

    this.route('index', function() {});
    this.route('loading');
    this.route('region');
    this.route('hospital');
    this.route('representative');
  });
  this.route('page-notice', { path: 'notice/:proposal_id' });
  this.route('page-scenario', { path: 'scenario/:proposal_id' }, function () {
    this.route('reference', function () {
      this.route('hospital');
      this.route('performance');
    });
    this.route('decision-review');

    this.route('index', function () {
      this.route('hospital-config', { path: 'hospital/:destConfig_id' });
      this.route('member');
      this.route('performance');
      this.route('city-hospital');
      this.route('region');
      this.route('representative');
      this.route('hospital');
    });
    this.route('business', function () {
        this.route('hospitalConfig', { path: 'hospital/:destConfig_id' });
    });
    this.route('index-loading');
  });
  this.route('page-report', { path: 'report' });
  this.route('page-history-report', { path: 'history/:paper_id' });
  this.route('page-scenario-loading');
});

export default Router;
