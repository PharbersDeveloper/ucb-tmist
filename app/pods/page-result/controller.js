import Controller from '@ember/controller';

export default Controller.extend({
	actions: {
		checkManagerReport() {
			this.transitionToRoute('page-report');
		}
	}
});
