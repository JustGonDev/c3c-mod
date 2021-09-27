/**
 * Obfuscate a string.
 *
 * @param   {string}  data  A string that you want to obfuscate.
 *
 * @return  {string}        An obfuscated string.
 */
module.exports = function obf(data) {
  function Obfuscator(repl) {
    this.nrepl = 0;
    this.replacements = {};
    this.revreplacements = {};

    function removeDupes(str) {
      var rv = "";
      for (var i = 0; i < str.length; i++) {
        var ch = str.charAt(i);
        if (rv.indexOf(ch) == -1) {
          rv += ch;
        }
      }
      return rv;
    }
    for (var i = 0; i < repl.length; i++) {
      var r = repl[i];
      var original = r.charAt(0);
      var s = removeDupes(r);
      if (s.length > 1) {
        for (var j = 0; j < s.length; j++) {
          this.replacements[s.charAt(j)] = s.substring(0, j) + s.substring(j + 1);
          if (s.charAt(j) !== original) {
            this.revreplacements[s.charAt(j)] = original;
          }
          this.nrepl++;
        }
      }
    }
  }
  Obfuscator.prototype.obfuscate = function (str) {
    str = str + "";
    var rv = "";
    for (var i = 0; i < str.length; i++) {
      var c = str.charAt(i);
      var r = this.replacements[c];
      if (r) {
        var j = Math.floor(Math.random() * (r.length - 1));
        rv += r.charAt(r.charAt(j) == c ? j + 1 : j);
      } else {
        rv += c;
      }
    }
    return rv;
  };
  Obfuscator.prototype.deobfuscate = function (str) {
    str = str + "";
    var rv = "";
    for (var i = 0; i < str.length; i++) {
      var c = str.charAt(i);
      var r = this.revreplacements[c];
      if (r) {
        rv += r;
      } else {
        rv += c;
      }
    }
    return rv;
  };
  var strongObfuscator = new Obfuscator([
    "AÀÁÂÃÄÅĀĂĄǍǞǠȀȂȦΆΑАѦӐӒḀẠẢẤẦẨẬẶἈἉᾈᾉᾸᾹᾺᾼ₳ÅȺẮẰẲẴἌἎἏᾌΆǺẪ",
    "BƁΒВḂḄḆ",
    "CÇĆĈĊČƇʗСҪḈ₢₵ℂⅭϹϾҀ",
    "DÐĎĐƉƊḊḌḎḐḒⅮ",
    "EÈÉÊËĒĔĖĘĚȄȆȨΕЀЁЕӖḘḚḜẸẺẼẾỀỆḔḖỂỄԐℇƐἙῈЄ",
    "FϜḞ₣ҒƑϝғҒ₣",
    "GĜĞĠĢƓǤǦǴḠ₲",
    "HĤĦȞΗНҢҤӇӉḢḤḦḨḪῌꜦ",
    "IΊÌÍÎÏĨĪĬĮİƖƗǏȈȊΙΪІЇӀӏḬḮỈỊἸἹῘῙῚǐ1",
    "JĴʆЈʃ",
    "KĶƘǨΚЌКԞḰḲḴ₭K",
    "LĹĻĽĿŁԼḶḸḺḼℒⅬ˪",
    "MΜМӍḾṀṂⅯ",
    "NÑŃŅŇǸΝṄṆṈṊ₦Ɲ",
    "O0θϑ⍬ÒÓÔÕÖØŌŎŐƆƟƠǑǪǬǾȌȎȪȬȮȰΘΟϴОѲӦӨӪՕỌỎỐỒỔỘỚỜỞỠỢΌΌṌṐṒὈʘṎỖ",
    "PƤΡРҎṔṖῬ₱ℙ",
    "QԚℚ",
    "RŔŖŘȐȒṘṚṜṞ℞ɌⱤ",
    "SŚŜŞŠȘЅՏṠṢṨṤṦ",
    "TŢŤŦƮȚΤТҬṪṬṮṰ₮ȾΊΊꚌ",
    "UÙÚÛÜŨŪŬŮŰŲƯǓǕǗǛȔȖԱՍṲṴṶṸỤỦỨỪỬỮỰǙ⊍⊎Մ⊌Ṻ",
    "VѴѶṼṾ⋁ⅤƲ",
    "WŴԜẀẂẄẆẈ₩ƜШ",
    "XΧХҲẊẌⅩ",
    "Y¥ÝŶŸƳȲΥΫϓУҮҰẎỲỴỶỸῨῩ",
    "ZŹŻŽƵȤΖẐẒẔ",
    "aàáâãäåāăąǎǟǡǻȁȃȧаӑӓḁẚạảấầẩẫậắằẳẵặɑάαἀἁἂἃἄἅἆἇὰάᾀᾁᾂᾃᾄᾅᾆᾇᾰᾱᾲᾳᾴᾶᾷ⍶⍺ɑ",
    "bƀƃƅɒɓḃḅḇþϸƄьҍ",
    "cçćĉċčƈςϛсҫḉⅽ¢ϲҁ",
    "dďđɖɗḋḍḏḑḓⅾƌժ₫ð",
    "eèéêëēĕėęěȅȇȩеѐёҽҿӗḕḗḙḛḝẹẻẽếềểễệεɛϵєϱѳөӫɵ",
    "fſḟẛƒғϝ£ƒ",
    "gĝğġģǥǧǵɠɡգզցḡɕʛɢ",
    "hĥħȟɦɧћիհḣḥḧḩḫẖℏһʜӊ",
    "iį¡ìíîïĩīĭįıǐȉȋɨɩΐίιϊіїɪḭḯỉịἰἱἲἳὶίῑΐῐῒῖὶ",
    "jĵǰȷɟʝјյϳ",
    "kķĸƙǩκкҝҟḱḳḵ",
    "lŀĺļľłƚǀɫɬɭḷḹḻḽŀ⎩ḹ",
    "mɱḿṁṃ₥ⅿ",
    "nɴñńņňŉŋƞǹɲɳήηπпբդըղոռրṅṇṉṋἠἡἢἣἤἥἦἧὴήᾐᾑᾒᾓᾔᾕᾖᾗῂῃῄῆῇი",
    "oòóôõöōŏőơǒǫǭȍȏȫȭȯȱʘοόоӧծձօṍṏṑṓọỏốồổỗộớờởỡợὀὁὂὃὄὅὸόσ๐",
    "pþρрҏթṕṗῤῥ⍴",
    "qʠԛգզϙ",
    "rŕŗřȑȓɼɽгѓґӷṙṛṝṟгѓґӷ",
    "sśŝşšșʂѕԑṡṣṥṧṩ",
    "tţťŧƫțʈṫṭṯṱẗȶէե†ԷՒէȽҭ",
    "uµùúûüũūŭůűųưǔǖǘǚǜȕȗɥμυцկմնսվևṳṵṷṹṻụủứừửữự",
    "vʋνѵѷүұṽṿⅴ∨ΰϋύὐὑὒὓὔὕὖὗὺύῠῡῢΰῦῧʋ",
    "wŵԝẁẃẅẇẉẘ",
    "xϰхҳẋẍⅹ",
    "yýÿŷƴȳγуўӯӱӳẏẙỳỵỷỹʏ",
    "zźżžƶȥʐʑẑẓẕ",
    "2ƻƨշ",
    "3ЗҘӞƷӠЗҘӞՅɜɝзҙӟ",
    "4ЧЧӴ",
    "5Ƽ",
    "6əǝә",
    "8Ց",
    // ☌øǿ - ???
    "БƂ",
    "ГΓЃҐӶ",
    "ЖҖӜ",
    "ИЍӢӤ",
    "ЙҊ",
    "ЛӅԒΛ",
    "ПΠ",
    "ЦҴ",
    "ЬƄ",
    "ЫӸ",
    "ЪѢՒ",
    "ЭӬ",
    "вʙʙɞ",
    "жҗӂӝ",
    "зƨɜɝӟ",
    "иѝӥ",
    "йҋӣ",
    "кĸκќқҝҟҡԟ",
    "лӆԓ",
    "мӎ",
    "нʜңҥӈӊ",
    "цџҵ",
    "чҷҹӌӵ",
    "шɯա",
    "ъѣ",
    "ыӹ",
    "эǝɘəӭэӭ"
  ]);
  return strongObfuscator.obfuscate(data) || "";
}
