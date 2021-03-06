import DS from 'ember-data';

export default DS.Model.extend({
	time: DS.attr('number'), // 只用于排序
	accountId: DS.attr('string'),
	proposalId: DS.attr('string'),
	name: DS.attr('string'),
	describe: DS.attr('string'),
	startTime: DS.attr('formatDateStandard'),
	endTime: DS.attr('formatDateStandard'),
	state: DS.attr('number'),
	totalPhase: DS.attr('number'),
	paperinputs: DS.hasMany('paperinput'),
	salesReports: DS.hasMany('salesReport'),
	personnelAssessments: DS.hasMany('personnelAssessment'),
	assessmentReports: DS.hasMany('assessmentReport')
});
