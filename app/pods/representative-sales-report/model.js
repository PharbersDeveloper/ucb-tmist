import DS from 'ember-data';

export default DS.Model.extend({
	representativeName: DS.attr('string'),
	productName: DS.attr('string'),
	sales: DS.attr('number'),	// 销售额
	salesGrowth: DS.attr('number'), //销售增长率
	salesQuota: DS.attr('number'),	// 销售指标
	share: DS.attr('number'),	// 份额
	quotaAchievement: DS.attr('number'),	// 指标达成率
	potential: DS.attr('number'),	//	潜力
	quotaContribute: DS.attr('number'),	// 指标贡献率
	quotaGrowth: DS.attr('number'),		// 指标增长率
	salesContribute: DS.attr('number'),	// 销售额贡献率
	salesMonthOnMonth: DS.attr('number'),// 销售额环比增长
	salesYearOnYear: DS.attr('number'),		// 销售额同比增长
	ytdSales: DS.attr('number'),	// YTD 销售额
	destConfig: DS.belongsTo(),
	goodsConfig: DS.belongsTo(),
	resourceConfig: DS.belongsTo()
});
