import DS from 'ember-data';

export default DS.Model.extend({
	goodsSalesTarget: DS.attr('number'),	//产品销售指标
	goodsSalesBudgets: DS.attr('number'),	// 产品销售预算
	goodsConfig: DS.belongsTo()
});
