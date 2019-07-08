import DS from 'ember-data';

export default DS.Model.extend({
	dailyCost: DS.attr('number'),	//日使用费用
	productType: DS.attr('number'),
	priceType: DS.attr('string'),
	lifeCycle: DS.attr('string'),
	launchTime: DS.attr('formatDateStandard'),
	productCategory: DS.attr('string'),
	treatmentArea: DS.attr('string'),
	productFeature: DS.attr('string'),
	patentDescribe: DS.attr('string'),
	referencePrice: DS.attr('number'),
	costPrice: DS.attr('number'),
	costEffective: DS.attr('string'),
	safety: DS.attr('string'),
	effectiveness: DS.attr('string'),
	convenience: DS.attr('string'),
	targetDepartment: DS.attr('string'),
	product: DS.belongsTo()
});
