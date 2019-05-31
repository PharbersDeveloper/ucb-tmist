import DS from 'ember-data';

export default DS.Model.extend({
	accessStatus: DS.attr('string'),
	patientCount: DS.attr('number'),
	potential: DS.attr('number'),	// 潜力
	salesTarget: DS.attr('number'),	// 销售指标
	destConfig: DS.belongsTo(),
	goodsConfig: DS.belongsTo(),
	salesReport: DS.belongsTo()
});
