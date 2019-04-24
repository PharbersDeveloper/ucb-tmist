import Controller from '@ember/controller';

export default Controller.extend({
	groupValue: 'index',
	actions: {
		linkToRoute(routeCode) {
			let proposalId = this.get('proposalId'),
				route = routeCode === 'index' ? '' : routeCode;

			this.set('groupValue', routeCode);
			this.transitionToRoute('/scenario/' + proposalId + '/reference/' + route);
		}
	}
});
