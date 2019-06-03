import DS from 'ember-data';

export default DS.Model.extend({
	salesTarget: DS.attr('number'),	// 销售目标设定
	budget: DS.attr('number'),	// 预算费用
	goodsConfig: DS.belongsTo(),
	destConfigId: DS.attr('string')
});
