import DS from 'ember-data';

export default DS.Model.extend({
	salesTarget: DS.attr('blank-nan'),	// 销售目标设定
	budget: DS.attr('blank-nan'),	// 预算费用
	goodsConfig: DS.belongsTo(),
	destConfigId: DS.attr('string')
});
