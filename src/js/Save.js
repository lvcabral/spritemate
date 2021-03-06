import $ from 'jquery'
import { status } from './helper'

export default class Save
{

  constructor(window,config,eventhandler)
  {
    this.config = config;
    this.window = window;
    this.default_filename ="mysprites";
    this.eventhandler = eventhandler;

    let template = `
    <div id="window-save">

      <div class="center">
        Filename: <input autofocus type="text" id="filename" name="filename" value="${this.default_filename}">
        <p>The file will be saved to your browser's default download location.</p>
      </div>
      <br/>
      <fieldset>
        <legend>Spritemate // *.spm</legend>
        <button id="button-save-spm">Save as Spritemate</button>
        <p>JSON file format for spritemate. Recommended as long as you are not done working on the sprites.</p>
      </fieldset>
    
      <fieldset>
        <legend>Spritepad // *.spd</legend>
        <div class="fieldset right">
          <button id="button-save-spd">Save as 2.0</button>
          <button id="button-save-spd-old">Save as 1.8.1</button>
        </div>
        <p>Choose between the 2.0 beta or the older 1.8.1 file format, which is recommended if you want to import the data in your C64 project.</p>
      </fieldset>

      <fieldset>
        <legend>Assembly code // *.txt</legend>
        <div class="fieldset right">
          <button id="button-save-source-kick">KICK ASS (hex)</button>
          <button id="button-save-source-kick-binary">KICK ASS (binary)</button>
          <button id="button-save-source-acme">ACME (hex)</button>
          <button id="button-save-source-acme-binary">ACME (binary)</button>
        </div>
        <p>A text file containing the sprite data in assembly language. KICK ASS and ACME are compilers with slightly different syntax. Choose "hex" to save a byte like $01 or "binary" for %00000001.</p>
      </fieldset>

      <fieldset>
        <legend>BASIC // *.bas</legend>
        <button id="button-save-basic">Save as BASIC 2.0</button>
        <p>A BASIC 2.0 text file that you can copy & paste into VICE.</p>
      </fieldset>

      <fieldset>
        <legend>PNG image</legend>
        <p>To save a sprite as a PNG image, "right click" on the sprite in the PREVIEW window. Your browser will display a "save image as..." option in the context menu. The size of the PNG can be set with the zoom levels of the PREVIEW window.</p>
      </fieldset>

      <div id="button-row">
        <button id="button-save-cancel" class="button-cancel">Cancel</button>
      </div>
    </div> 
    `;

    $("#window-"+this.window).append(template);
    $("#window-"+this.window).dialog({ show: 'fade', hide: 'fade' });
    $('#button-save-cancel').mouseup((e) => this.close_window());
    $('#button-save-spm').mouseup((e) => this.save_spm());
    $('#button-save-spd').mouseup((e) => this.save_spd("new"));
    $('#button-save-spd-old').mouseup((e) => this.save_spd("old"));
    $('#button-save-source-kick').mouseup((e) => this.save_assembly("kick", false));
    $('#button-save-source-kick-binary').mouseup((e) => this.save_assembly("kick", true));
    $('#button-save-source-acme').mouseup((e) => this.save_assembly("acme", false));
    $('#button-save-source-acme-binary').mouseup((e) => this.save_assembly("acme", true));
    $('#button-save-basic').mouseup((e) => this.save_basic());

    $( "#filename" ).keyup((e) => 
    {
      this.default_filename = $("#filename").val();
      if (this.default_filename.length < 1)
      {
        $("#filename").addClass("error");
        $('#button-save-spm').prop('disabled', true).addClass("error");
        $('#button-save-spd').prop('disabled', true).addClass("error");
        $('#button-save-spd-old').prop('disabled', true).addClass("error");
        $('#button-save-source-kick').prop('disabled', true).addClass("error");
        $('#button-save-source-kick-binary').prop('disabled', true).addClass("error");
        $('#button-save-source-acme').prop('disabled', true).addClass("error");
        $('#button-save-source-acme-binary').prop('disabled', true).addClass("error");
        $('#button-save-basic').prop('disabled', true).addClass("error");
      }else{
        $("#filename").removeClass("error");
        $('#button-save-spm').prop('disabled', false).removeClass("error");
        $('#button-save-spd').prop('disabled', false).removeClass("error");
        $('#button-save-spd-old').prop('disabled', false).removeClass("error");
        $('#button-save-source-kick').prop('disabled', false).removeClass("error");
        $('#button-save-source-kick-binary').prop('disabled', false).removeClass("error");
        $('#button-save-source-acme').prop('disabled', false).removeClass("error");
        $('#button-save-source-acme-binary').prop('disabled', false).removeClass("error");
        $('#button-save-basic').prop('disabled', false).removeClass("error");
      }
    });


   
  }

  // https://stackoverflow.com/questions/13405129/javascript-create-and-save-file


  save_file_to_disk(file,filename)
  {
      
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }

    status("File has been saved.");
    $('#menubar-filename-name').html(filename);
  }


  save_spm()
  {
    let filename = this.default_filename + ".spm";
    let data = JSON.stringify(this.savedata);
    // these regular expressions are used to make the outpult file
    // easier to read with line breaks
    data = data.replace(/],/g,'],\n').replace(/\[\[/g,'[\n[').replace(/]]/g,']\n]');
    let file = new Blob([data], {type: "text/plain"});
    this.save_file_to_disk(file,filename);
    this.close_window();
  }

  save_assembly(format, encode_as_binary)
  {
    let filename = this.default_filename + ".txt";
    var data = this.create_assembly(format, encode_as_binary);
    let file = new Blob([data], {type: "text/plain"});
    this.save_file_to_disk(file,filename);
    this.close_window();
  }

  save_spd(format)
  {
    let filename = this.default_filename + ".spd";
    var hexdata = this.create_spd_array(format);
    var bytes = new Uint8Array(hexdata);
    var file = new Blob([bytes], {type: "application/octet-stream"});
    this.save_file_to_disk(file,filename);
    this.close_window();
  }

  save_basic()
  {
    let filename = this.default_filename + ".bas";
    var data = this.create_basic();
    let file = new Blob([data], {type: "text/plain"});
    this.save_file_to_disk(file,filename);
    this.close_window();
  }


/*

   SSSSSSSSSSSSSSS PPPPPPPPPPPPPPPPP   DDDDDDDDDDDDD        
 SS:::::::::::::::SP::::::::::::::::P  D::::::::::::DDD     
S:::::SSSSSS::::::SP::::::PPPPPP:::::P D:::::::::::::::DD   
S:::::S     SSSSSSSPP:::::P     P:::::PDDD:::::DDDDD:::::D  
S:::::S              P::::P     P:::::P  D:::::D    D:::::D 
S:::::S              P::::P     P:::::P  D:::::D     D:::::D
 S::::SSSS           P::::PPPPPP:::::P   D:::::D     D:::::D
  SS::::::SSSSS      P:::::::::::::PP    D:::::D     D:::::D
    SSS::::::::SS    P::::PPPPPPPPP      D:::::D     D:::::D
       SSSSSS::::S   P::::P              D:::::D     D:::::D
            S:::::S  P::::P              D:::::D     D:::::D
            S:::::S  P::::P              D:::::D    D:::::D 
SSSSSSS     S:::::SPP::::::PP          DDD:::::DDDDD:::::D  
S::::::SSSSSS:::::SP::::::::P          D:::::::::::::::DD   
S:::::::::::::::SS P::::::::P          D::::::::::::DDD     
 SSSSSSSSSSSSSSS   PPPPPPPPPP          DDDDDDDDDDDDD        

 */

  create_spd_array(format)
  {

    // SPD file format information
    // bytes 00,01,02 = "SPD"
    // byte 03 = version number of spritepad
    // byte 04 = number of sprites
    // byte 05 = number of animations
    // byte 06 = color transparent
    // byte 07 = color multicolor 1
    // byte 08 = color multicolor 2
    // byte 09 = start of sprite data
    // byte 73 = 0-3 color, 4 overlay, 7 multicolor/singlecolor
    // bytes xx = "00", "00", "01", "00" added at the end of file (SpritePad animation info)
    
    var data = []

    if (format == "new")
    {
      data.push(83,80,68); // the "SPD" header that identifies SPD files apparently
      data.push(1,this.savedata.sprites.length-1,0); // number of sprites
    }

    data.push(this.savedata.colors[0],this.savedata.colors[2],this.savedata.colors[3]); // colors
    
    var byte = "";
    var bit = "";

    for (var j=0; j<this.savedata.sprites.length; j++)  // iterate through all sprites
    {

      var spritedata = [].concat.apply([], this.savedata.sprites[j].pixels); // flatten 2d array
      
      var is_multicolor = this.savedata.sprites[j].multicolor;
      var is_overlay = this.savedata.sprites[j].overlay;

      var stepping = 1; 
      if (is_multicolor) stepping = 2; // for multicolor, half of the array data can be ignored

      // iterate through the pixel data array 
      // and create a hex values based on multicolor or singlecolor
      for(var i=0; i<spritedata.length; i=i+8)
      {
        for (let k=0; k<8; k=k+stepping)
        {
          let pen = spritedata[i+k];

          if (is_multicolor)
          {
            if (pen == 0) bit = "00";
            if (pen == 1) bit = "10";
            if (pen == 2) bit = "01";
            if (pen == 3) bit = "11"; 
          }

          if (!is_multicolor)
          {
            bit = "1";
            if (pen == 0) bit = "0";
          } 
         
          byte = byte + bit;
        }

        let hex = parseInt(byte, 2);
        data.push(hex);
        byte = "";

      }

      // finally, we add multicolor, overlay and color info for byte 64
      
      // bit 7 of the high nibble stands for multicolor
      let multicolor = "00";
      if (is_multicolor) multicolor = "10";

      // bit 4 of the high nibble stands for overlay
      let overlay = "00";
      if (is_overlay) overlay = "01";

      let high_nibble = multicolor + overlay;

      var low_nibble = ("000" + (this.savedata.sprites[j].color >>> 0).toString(2)).slice(-4);
      
      let color_byte = parseInt(high_nibble + low_nibble, 2);
      data.push(color_byte); // should be the individual color
    }

    if (format == "new")
    {
      // almost done, just add some animation data crap at the end
      data.push(0,0,1,0); // SpritePad animation info (currently unused) 
    }

    return data;
  }

/*

               AAA                 SSSSSSSSSSSSSSS MMMMMMMM               MMMMMMMM
              A:::A              SS:::::::::::::::SM:::::::M             M:::::::M
             A:::::A            S:::::SSSSSS::::::SM::::::::M           M::::::::M
            A:::::::A           S:::::S     SSSSSSSM:::::::::M         M:::::::::M
           A:::::::::A          S:::::S            M::::::::::M       M::::::::::M
          A:::::A:::::A         S:::::S            M:::::::::::M     M:::::::::::M
         A:::::A A:::::A         S::::SSSS         M:::::::M::::M   M::::M:::::::M
        A:::::A   A:::::A         SS::::::SSSSS    M::::::M M::::M M::::M M::::::M
       A:::::A     A:::::A          SSS::::::::SS  M::::::M  M::::M::::M  M::::::M
      A:::::AAAAAAAAA:::::A            SSSSSS::::S M::::::M   M:::::::M   M::::::M
     A:::::::::::::::::::::A                S:::::SM::::::M    M:::::M    M::::::M
    A:::::AAAAAAAAAAAAA:::::A               S:::::SM::::::M     MMMMM     M::::::M
   A:::::A             A:::::A  SSSSSSS     S:::::SM::::::M               M::::::M
  A:::::A               A:::::A S::::::SSSSSS:::::SM::::::M               M::::::M
 A:::::A                 A:::::AS:::::::::::::::SS M::::::M               M::::::M
AAAAAAA                   AAAAAAASSSSSSSSSSSSSSS   MMMMMMMM               MMMMMMMM


 */

  create_assembly(format, encode_as_binary)
  {

    var comment = "; ";
    var prefix = "!";
    var label_suffix = "";

    if (format == "kick")
    {
      comment = "// ";
      prefix = ".";
      label_suffix =":";
    }

    var data = "";

    data += "\n" + comment + this.savedata.sprites.length + " sprites generated with spritemate on " + new Date().toLocaleString();
    if (!encode_as_binary)
      data += "\n" + comment + "Byte 64 of each sprite contains multicolor (high nibble) & color (low nibble) information";

    data += "\n\nLDA #$" + ("0" + this.savedata.colors[2].toString(16)).slice(-2) + " "+comment+"sprite multicolor 1";
    data += "\nSTA $D025";
    data += "\nLDA #$" + ("0" + this.savedata.colors[3].toString(16)).slice(-2) + " "+comment+"sprite multicolor 2";
    data += "\nSTA $D026";
    data += "\n";
    
    var byte = "";
    var bit = "";

    for (var j=0; j<this.savedata.sprites.length; j++)  // iterate through all sprites
    {

      var spritedata = [].concat.apply([], this.savedata.sprites[j].pixels); // flatten 2d array
      var is_multicolor = this.savedata.sprites[j].multicolor;
      var stepping = 1; 
      if (is_multicolor) stepping = 2; // for multicolor, half of the array data can be ignored
      var line_breaks_after = encode_as_binary ? 24 : 64;

      data += "\n\n" + comment + "sprite " + (j);
      if(is_multicolor)
      {
        data += " / " + "multicolor";
      }else{
        data += " / " + "singlecolor";
      }

      data += " / color: " + "$" +("0" + this.savedata.sprites[j].color.toString(16)).slice(-2);
      data += "\n" + this.savedata.sprites[j].name + label_suffix + "\n";
      
      // iterate through the pixel data array 
      // and create a hex or binary values based on multicolor or singlecolor
      for(var i=0; i<spritedata.length; i=i+8)
      {

        if (i%line_breaks_after == 0)
        {
          data = data.substring(0, data.length - 1);
          data +="\n"+prefix+"byte ";
        }

        for (let k=0; k<8; k=k+stepping)
        {
          let pen = spritedata[i+k];

          if (is_multicolor)
          {
            if (pen == 0) bit = "00";
            if (pen == 1) bit = "10";
            if (pen == 2) bit = "01";
            if (pen == 3) bit = "11"; 
          }

          if (!is_multicolor)
          {
            bit = "1";
            if (pen == 0) bit = "0";
          } 
         
          byte = byte + bit;
        }

        if (encode_as_binary)
        {
          data += "%"+byte+",";
        } else {
          let hex = parseInt(byte, 2).toString(16);
          data += "$"+("0"+hex).slice(-2)+",";
        }
        byte = "";

      }

      if (encode_as_binary)
      {
          data = data.substring(0, data.length - 1);
      } else {
        // finally, we add multicolor and color info for byte 64
        var high_nibble = "0000";
        if (is_multicolor) high_nibble = "1000";

        var low_nibble = ("000" + (this.savedata.sprites[j].color >>> 0).toString(2)).slice(-4);

        let color_byte = "$" +("0" + parseInt(high_nibble + low_nibble, 2).toString(16)).slice(-2);
        data += color_byte; // should be the individual color
      }
    }
    
    return data;
  }

/*

BBBBBBBBBBBBBBBBB               AAA                 SSSSSSSSSSSSSSS IIIIIIIIII      CCCCCCCCCCCCC
B::::::::::::::::B             A:::A              SS:::::::::::::::SI::::::::I   CCC::::::::::::C
B::::::BBBBBB:::::B           A:::::A            S:::::SSSSSS::::::SI::::::::I CC:::::::::::::::C
BB:::::B     B:::::B         A:::::::A           S:::::S     SSSSSSSII::::::IIC:::::CCCCCCCC::::C
  B::::B     B:::::B        A:::::::::A          S:::::S              I::::I C:::::C       CCCCCC
  B::::B     B:::::B       A:::::A:::::A         S:::::S              I::::IC:::::C              
  B::::BBBBBB:::::B       A:::::A A:::::A         S::::SSSS           I::::IC:::::C              
  B:::::::::::::BB       A:::::A   A:::::A         SS::::::SSSSS      I::::IC:::::C              
  B::::BBBBBB:::::B     A:::::A     A:::::A          SSS::::::::SS    I::::IC:::::C              
  B::::B     B:::::B   A:::::AAAAAAAAA:::::A            SSSSSS::::S   I::::IC:::::C              
  B::::B     B:::::B  A:::::::::::::::::::::A                S:::::S  I::::IC:::::C              
  B::::B     B:::::B A:::::AAAAAAAAAAAAA:::::A               S:::::S  I::::I C:::::C       CCCCCC
BB:::::BBBBBB::::::BA:::::A             A:::::A  SSSSSSS     S:::::SII::::::IIC:::::CCCCCCCC::::C
B:::::::::::::::::BA:::::A               A:::::A S::::::SSSSSS:::::SI::::::::I CC:::::::::::::::C
B::::::::::::::::BA:::::A                 A:::::AS:::::::::::::::SS I::::::::I   CCC::::::::::::C
BBBBBBBBBBBBBBBBBAAAAAAA                   AAAAAAASSSSSSSSSSSSSSS   IIIIIIIIII      CCCCCCCCCCCCC

 */

  create_basic()
  {
    let line_number = 10;
    let line_inc = 10;
    let data = "";
    let max_sprites = Math.min(8,this.savedata.sprites.length); // display up to 8 sprites

    data += line_number + ' print chr$(147)';
    line_number+=line_inc;
    data += "\n" + line_number + ' print "generated with spritemate"';
    line_number+=line_inc;
    data += "\n" + line_number + ' print "' + max_sprites + " of " + this.savedata.sprites.length + ' sprites displayed."';
    line_number+=line_inc;
    data += "\n" + line_number + " poke 53285,"+this.savedata.colors[2]+": rem multicolor 1";
    line_number+=line_inc;
    data += "\n" + line_number + " poke 53286,"+this.savedata.colors[3]+": rem multicolor 2";
    line_number+=line_inc;
    data += "\n" + line_number + " poke 53269,255 : rem set all 8 sprites visible";
    line_number+=line_inc;
    data += "\n" + line_number + " for x=12800 to 12800+"+(this.savedata.sprites.length*64-1)+": read y: poke x,y: next x: rem sprite generation";
    line_number+=line_inc;

    
    let multicolor_byte = 0;
    let double_x_byte = 0;
    let double_y_byte = 0;

    for (let j=0; j<max_sprites; j++)  // iterate through all sprites
    { 
      data += "\n" + line_number + " :: rem "+this.savedata.sprites[j].name;
      line_number+=line_inc;
      data += "\n" + line_number + " poke "+ (53287+j) + "," + this.savedata.sprites[j].color + ": rem color = " + this.savedata.sprites[j].color;
      line_number+=line_inc;

      data += "\n" + line_number + " poke "+ (2040+j) + "," + (200+j) + ": rem pointer";
      line_number+=line_inc;

      let xpos = (j*48+24+20);
      let ypos = 120;

      if (j>=4){
        xpos -= 4*48;
        ypos += 52;
      }

      data += "\n" + line_number + " poke "+ (53248+j*2) + ", " + xpos + ": rem x pos";
      line_number+=line_inc;

      data += "\n" + line_number + " poke "+ (53249+j*2) + ", " + ypos + ": rem y pos";
      line_number+=line_inc;

      // this bit manipulation is brilliant Ingo
      if (this.savedata.sprites[j].multicolor) multicolor_byte = multicolor_byte | 1<<j;
      if (this.savedata.sprites[j].double_x) double_x_byte = double_x_byte | 1<<j;
      if (this.savedata.sprites[j].double_y) double_y_byte = double_y_byte | 1<<j;

    } 
    
    data += "\n" + line_number + " poke 53276, " + multicolor_byte + ": rem multicolor";
    line_number+=line_inc;
    data += "\n" + line_number + " poke 53277, " + double_x_byte + ": rem width";
    line_number+=line_inc;
    data += "\n" + line_number + " poke 53271, " + double_y_byte + ": rem height";
    line_number+=line_inc;
    
    let byte = "";
    let bit = "";

    line_number=1000;
    for (let j=0; j<this.savedata.sprites.length; j++)  // iterate through all sprites
    {

      var spritedata = [].concat.apply([], this.savedata.sprites[j].pixels); // flatten 2d array
      var is_multicolor = this.savedata.sprites[j].multicolor;
      var stepping = 1; 
      if (is_multicolor) stepping = 2; // for multicolor, half of the array data can be ignored

      data += "\n" + line_number + " :: rem " + this.savedata.sprites[j].name;
      line_number+=line_inc;

      if(is_multicolor)
      {
        data += " / " + "multicolor";
      }else{
        data += " / " + "singlecolor";
      }

      data += " / color: " + this.savedata.sprites[j].color;
      
      
      // iterate through the pixel data array 
      // and create a hex values based on multicolor or singlecolor
      for(var i=0; i<spritedata.length; i=i+8)
      {

        if (i%128 == 0)
        {
          data += "\n" + line_number + " data ";
          line_number+=line_inc;
        }

        for (let k=0; k<8; k=k+stepping)
        {
          let pen = spritedata[i+k];

          if (is_multicolor)
          {
            if (pen == 0) bit = "00";
            if (pen == 1) bit = "10";
            if (pen == 2) bit = "01";
            if (pen == 3) bit = "11"; 
          }

          if (!is_multicolor)
          {
            bit = "1";
            if (pen == 0) bit = "0";
          } 
         
          byte = byte + bit;
        }

        let hex = parseInt(byte, 2).toString(10);
        data += hex +",";
        byte = "";

      }
      
      
      // finally, we add multicolor and color info for byte 64
      var high_nibble = "0000";
      if (is_multicolor) high_nibble = "1000";

      var low_nibble = ("000" + (this.savedata.sprites[j].color >>> 0).toString(2)).slice(-4);
      
      let color_byte = parseInt(high_nibble + low_nibble, 2).toString(10);
      data += color_byte; // should be the individual color
      
    }

    data += "\n";
    data = data.replace(/,\n/g,'\n'); // removes all commas at the end of a DATA line
    
    return data;
  }


  set_save_data(savedata)
  {
    this.savedata = savedata;
  }

  close_window()
  {
      $("#window-"+this.window).dialog( "close" );
      this.eventhandler.onLoad(); // calls "regain_keyboard_controls" method in app.js
  }


}


