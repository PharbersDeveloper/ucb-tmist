import DS from 'ember-data';

export default DS.Model.extend({
	paperId: DS.attr('string'),
	scenario: DS.belongsTo('scenario'),
	phase: DS.attr('number'),
	time: DS.attr('formatDateStandard'),
	businessinputs: DS.hasMany('businessinput')
	// managerinputs: DS.hasMany('managerinput'),
	// representativeinputs: DS.hasMany('representativeinput')
});
