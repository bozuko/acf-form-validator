(function($){
  
  'use strict';
  
  var config
    , initialized = false
    , validators = {}
    , validatorTypes
    , validatorKeys = []
    , _id = 0
  
  $(document).on('acf/setup_fields', function(e, container){
    if( !initialized ) initialize();
    $('.acf-form-validator').each(function(){
      var $el = $(this);
      if( $el.parentsUntil('.repeater', '.row-clone').length ) return;
      if( !$el.data('validator-id') ) (function( $el ){
        var validator = new Validator( $el );
        validators[validator.id] = validator;
      })( $el );
    });
  });
  
  $(document).on('submit', '#post', function(e){
    for( var i in validators ) if( validators.hasOwnProperty(i) ){
      validators[i].sync();
    }
  });
  
  $(function(){
    if( !acf.fields.repeater ) return;
    var remove = acf.fields.repeater.remove;
    acf.fields.repeater.remove = function( $tr ){
      var $el = $tr.find('.acf-form-validator');
      if( $el.length ){
        // find the field
        var id = $el.data('validator-id');
        if( validators[id] ){
          validators[id].destroy();
        }
      }
      return remove.call( acf.fields.repeater, $tr );
    }
  });
  
  function Validator( $el ){
    this.id = ++_id;
    this.$el = $el;
    this.$el.data('validator-id', this.id);
    this.$input = $el.find('.form-validator-value');
    this.$inputReal = $el.find('.form-validator-value-real');
    this.$ui = $el.find('.acf-form-validator-ui');
    
    
    this.$fields = $el.find('.validator-fields > tbody ');
    
    // inputs
    this.$type = this.$ui.find('[data-name="type"]');
    
    this.init();
    this.events();
    
    this.updateForm();
  }
  
  $.extend( Validator.prototype, {
    
    init : function(){
      var self = this;
      
      this.$inputReal.val('acf-form-validator-'+this.id);
      this.$input.attr('name', 'acf-form-validator-'+this.id);
      
      self.$type.append( $('<option />').val('').html('-Choose Validator-') );
      
      // add the types
      $.each(validatorKeys, function(i, key){
        var $option = $('<option />').val( key ).html( validatorTypes[key].label );
        self.$type.append( $option );
      });
      
      if( this.$input.val() ){
        this.update();
      }
    },
    
    events : function(){
      this.on('change', '[data-name="type"]', this.onTypeChange);
    },
    
    on : function( event, selector, fn ){
      var self = this;
      if( fn ) this.$el.on(event+'.acf-form-validator', selector, function(){
        return fn.apply(self, arguments);
      });
      else{
        fn = selector;
        this.$el.on(event, function(){
          return fn.apply(self, arguments);
        });
      }
    },
    
    destroy : function(){
      this.$el.off('acf-form-validator');
    },
    
    onTypeChange : function(e){
      this.updateForm();
    },
    
    getType : function(){
      return this.$type.find('option:selected').val();
    },
    
    updateForm : function(){
      
      if( !this.getType() ) return;
      
      // get the config...
      var cfg = validatorTypes[this.getType()]
        , val = this.getValueFromInput()
        , i, id, arg, $input
        
      this.$fields.empty();
      
      if( cfg.messages ) for( i in cfg.messages ) if( cfg.messages.hasOwnProperty(i) ) {
        id = 'validator_message_'+(++_id);
        var $tr = $('<tr />').appendTo(this.$fields);
        var $th = $('<th />').appendTo($tr);
        var $td = $('<td />').appendTo($tr);
        
        $('<label />')
          .attr('for', id )
          .html('<em>Message</em> '+i)
          .appendTo( $th );
          
        $input = $('<input type="text" />')
          .attr('data-validator-type', 'message')
          .attr('data-name', i)
          .attr('id', id)
          .addClass('control')
          .val(cfg.messages[i])
          .appendTo( $td )
          
        if( val && val.message && val.message[i] ){
          setValue( $input, val.message[i] );
        }
      }
      
      if( cfg.args ) for( i in cfg.args ) if( cfg.args.hasOwnProperty(i) ) {
        arg = cfg.args[i];
        id = 'validator_arg_'+(++_id);
        
        var $tr = $('<tr />').appendTo(this.$fields);
        var $th = $('<th />').appendTo($tr);
        var $td = $('<td />').appendTo($tr);
        
        $('<label />')
          .attr('for', id )
          .html('<em>Argument</em> '+arg.label)
          .appendTo( $th );
        
        $input = createInput( arg ).appendTo( $td );
        $input.attr('data-validator-type', 'arg');
        $input.attr('data-name', i);
        $input.attr('id', id);
        
        if( val && val.arg && val.arg[i] ){
          setValue( $input, val.arg[i] );
        }
      }
    },
    
    getValueFromForm : function(){
      
      if( !this.getType() ) return null;
      
      // go through all our fields
      var val = {
        classname: validatorTypes[this.getType()].classname,
        type: this.getType(),
        message: {},
        arg: {}
      };
      
      this.$fields.find('[data-validator-type="message"]').each(function(){
        val.message[$(this).data('name')] = $(this).val();
      });
      this.$fields.find('[data-validator-type="arg"]').each(function(){
        val.arg[$(this).data('name')] = $(this).val();
      });
      
      return val;
    },
    
    getValueFromInput : function(){
      return this.$input.val() ? JSON.parse( this.$input.val() ) : {};
    },
    
    update : function(){
      var val = this.getValueFromInput();
      console.log(val);
      this.$type.find('option[value="'+val.type+'"]').attr('selected', 'selected');
    },
    
    sync : function(){
      this.$input.val( JSON.stringify(this.getValueFromForm()) );
    },
    
    closeForm : function(){
      this.sync();
      
    },
    
    getTableValues : function( $table ){
      var values = {};
      
      $table.find('input,textarea').each(function(){
        values[$(this).attr('data-name')] = $(this).val();
      });
      $table.find('select').each(function(){
        values[$(this).attr('data-name')] = $(this).find('option:selected').val();
      });
      
      return values;
    }
    
  });
  
  function setValue($el, value) {
    if( $el.is('input,textarea') ) $el.val( value );
    else if( $el.is('select') ){
      $el.find('option[value="'+value+'"]').attr('selected', 'selected');
    }
  }
  
  function createInput( def, val ) {
    var $input;
    switch( def.input ){
      case 'select':
        $input = $('<select />');
        // check for options
        if( def.options ){
          var is_array = $.type( def.options ) == 'array';
          $.each( def.options, function(i, o){
            var $option = $('<option />');
            $option.html(o);
            $option.val(!is_array?i:o);
            $option.appendTo( $input );
          });
        }
        break;
      
      case 'field':
        $input = $('<input type="text" placeholder="Field name" />');
        break;
        
      case 'textarea':
        $input = $('<textarea />');
        break;
      
      case 'text':
      default:
        $input = $('<input type="text" />');
    }
    if( val ) setValue( $input, val);
    return $input;
  }
  
  
  function initialize(){
    initialized = true;
    validatorTypes = acf_field_form_validator.validators;
    for( var i in validatorTypes ) if( validatorTypes.hasOwnProperty(i) ){
      validatorKeys.push(i);
    }
  }
  
})(jQuery);