import DS from 'ember-data';

export default DS.Model.extend({
	name: DS.attr('string'),
	describe: DS.attr('string'),
	totalPhase: DS.attr('number'),
	inputIds: DS.attr(),
	salesReports: DS.hasMany('salesReport'),
	useableProposal: DS.belongsTo('useableProposal')
});
