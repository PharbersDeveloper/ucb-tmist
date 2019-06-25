import DS from 'ember-data';

export default DS.Model.extend({
	code: DS.attr('number'),
	text: DS.attr('string'),
	level: DS.belongsTo(),
	evaluation: DS.belongsTo()
});
