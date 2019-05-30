import DS from 'ember-data';

export default DS.Model.extend({
	doctorNumber: DS.attr('number'),
	bedNumber: DS.attr('number'),
	income: DS.attr('number'),
	potential: DS.attr('number'),
	lastYearSales: DS.attr('number'),
	spaceBelongs: DS.attr('string'),
	selfCostRatio: DS.attr('number'),		// 自费比例
	abilityToPay: DS.attr('string'),
	accessStatus: DS.attr('string'),
	hospital: DS.belongsTo('hospital'),
	policies: DS.hasMany('policy'),
	departments: DS.hasMany('department')
});
