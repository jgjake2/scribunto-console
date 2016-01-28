-- This module is meant to emulate many of MediaWiki's "magic words" and the parser function "titleparts"
-- Similar to the mw.title library, but far less expensive.
-- Run "p.debug()" in the console to see the data dump/potential uses

local p = {}
local _lang = nil
local table_to_string_max_depth = 3

function _table_tostring(v)
    return table.tostring(v)
end

function Try_table_tostring(v)
    local success, result = pcall(_table_tostring, v)
    
    return (success == true and result or 'nil')
end

function table_val_to_str ( v, indent, depth )
    indent = indent or ''
    depth = depth or 1
    if "string" == type( v ) then
        v = string.gsub( v, "\n", "\\n" )
        if string.match( string.gsub(v,"[^'\"]",""), '^"+$' ) then
            return "'" .. v .. "'"
        end
        return '"' .. string.gsub(v,'"', '\\"' ) .. '"'
    else
        return (v == nil and 'nil' or (type( v ) == "table" and (depth <= table_to_string_max_depth and table_tostring( v, indent, depth ) or '<<table>>') or (tostring( v ))))
    end
end

function table_key_to_str ( k, indent, depth )
    indent = indent or ''
    depth = depth or 1
    if "string" == type( k ) and string.match( k, "^[_%a][_%a%d]*$" ) then
        return k
    else
        return "[" .. table_val_to_str( k, indent, depth ) .. "]"
    end
end

function table_tostring( tbl, indent, depth )
    indent = indent or ''
    depth = depth or 1
    local indentNext = indent .. '\t'
    local result, done = {}, {}
    for k, v in ipairs( tbl ) do
        table.insert( result, table_val_to_str( v, indentNext, depth + 1 ) )
        done[ k ] = true
    end
    for k, v in pairs( tbl ) do
        if not done[ k ] then
            table.insert( result, table_key_to_str( k, indentNext, depth + 1 ) .. " = " .. table_val_to_str( v, indentNext, depth + 1 ) )
        end
    end
    return "{\r\n" .. indentNext .. table.concat( result, ",\r\n" .. indentNext ) .. "\r\n" .. indent .. "}"
end

function p.tableToString(tbl)
    return tbl ~= nil and table_tostring(tbl) or 'nil'
end

function lang()
    _lang = _lang or mw.getContentLanguage()
    return _lang
end

function split_path(str)
    return mw.text.split(str, '[\\/]+')
end

function getNamespace(str)
    local nsMatch, afterNs = mw.ustring.match(str or '', '^%s*([^:/]+):(.+)$', 1)
    if nsMatch ~= nil then
        if mw.site.namespaces[nsMatch] then
            return true, nsMatch, afterNs
        elseif mw.site.namespaces[lang():ucfirst(nsMatch)] then
            return true, lang():ucfirst(nsMatch), afterNs
        end
    end
end

function join_paths(p1, p2)
    local success, tNamespace, remainder = getNamespace(p2)
    if success == true and remainder then
        p2 = remainder
    end
    return (mw.ustring.match(p1, '^(.-)/?$') .. '/' .. mw.ustring.match(p2, '^/?(.-)$'))
end

function p.getTitleParts(title)
    local r = {}
    
    local success, tNamespace, remainder = getNamespace(title)
    if success == true then
        r.NS = mw.site.namespaces[tNamespace]
        r.namespace = (mw.site.namespaces[tNamespace] and mw.site.namespaces[tNamespace].name or tNamespace)
        title = mw.uri.decode(remainder, 'WIKI')
    else
        r.NS = mw.site.namespaces[0]
        r.namespace = r.NS.name or nil
        title = mw.uri.decode(title, 'WIKI')
    end
    
    local nsPrefix = (r.namespace and r.namespace ~= '' and (r.namespace .. ':') or '')
    
    r.PageName = title
    r.FullPageName = nsPrefix .. title
    r.RootPageName = title
    r.SubPageName = title
    r.ParentPageName = ''
    r.FullParentPageName = ''
    r.BasePageName = title
    r.TalkSpace = r.NS and r.NS.talk and r.NS.talk.name or ''
    r.TalkPage = (r.TalkSpace ~= '' and (r.TalkSpace .. ':' .. title) or '')
    
    r.parts = split_path(title) or {}
    r.parts.length = table.maxn(r.parts)
    
    r.isSubPage = (r.parts.length > 1 and true or false)
    
    r.getPart = function(index, length)
        if type(index) ~= "number" or r.parts.length == nil or r.parts.length == 0 then
            return nil
        end
        
        length = (type(length) == "number" and length or 0)
        
        while index < 1 do
            index = index + r.parts.length + 1
        end
            
        while index > r.parts.length do
            index = index - r.parts.length
        end
        
        while length <= 0 do
            length = length + r.parts.length
        end
        
        return table.concat(r.parts, '/', index, math.min(index + length - 1, r.parts.length))
    end
    
    if r.parts.length > 0 then
        r.SubPageName = r.getPart(-1)
        r.RootPageName = r.parts[1]
        if r.parts.length > 1 then
            r.BasePageName = table.concat(r.parts, '/', 1, math.max(r.parts.length - 1, 1))
            r.ParentPageName = r.getPart(-2,1)
            r.FullParentPageName = nsPrefix .. r.getPart(1,-1)
        end
    end
    
    local encodeWiki = function()
        local out = {}
        for i, v in ipairs(r.parts) do
            table.insert(out, mw.uri.encode(v, 'WIKI'))
        end
        return table.concat(out, '/')
    end

    
    r.getPath = function(length)
        return nsPrefix .. r.getPart(1, length)
    end
    
    r.join = function(newPath)
        return p.getTitleParts(join_paths(r.FullPageName, newPath))
    end
    
    r.partialUri = function(enctype)
        enctype = enctype or 'WIKI'
        if enctype == 'WIKI' then
            return encodeWiki()
        end
        return mw.uri.encode(r.PageName, enctype)
    end
    
    r.fullUri = function(enctype)
        enctype = enctype or 'WIKI'
        if enctype == 'WIKI' then
            return (nsPrefix .. encodeWiki())
        end
        return mw.uri.encode(r.FullPageName, enctype)
    end
	
	local _titleObj = nil
	r.getTitleObject = function()
		_titleObj = _titleObj or mw.title.new(r.FullPageName)
		return _titleObj
	end
	
	local _exists = nil
	r.exists = function()
		if _exists == nil then
			_exists = r.getTitleObject().exists
		end
		return _exists
	end
    
    return r
end

function p.debug(testTitle, maxDepth)
    table_to_string_max_depth = math.min(maxDepth ~= nil and tonumber(maxDepth) > 0 and tonumber(maxDepth) or table_to_string_max_depth, 3)
    testTitle = testTitle or 'Wookieepedia:Star_Wars:_Uprising_Super_Walkthrough/Stats/foo/bar'
    local titleParts = p.getTitleParts(testTitle)
    local titlePartsStr = p.tableToString(titleParts)
    mw.log('Debug Title (' .. testTitle .. ')\r\n\r\n================\r\n=== Return Val ===\r\n================');
    mw.log(titlePartsStr)
    mw.log('\r\n================\r\n=== Test Cases ===\r\n================')
    mw.log('titleParts.getPart(0)  >>  ' .. titleParts.getPart(0))
    mw.log('titleParts.getPart(0,1)  >>  ' .. titleParts.getPart(0,1))
    mw.log('titleParts.getPart(1,0)  >>  ' .. titleParts.getPart(1,0))
    mw.log('titleParts.getPart(1,-1)  >>  ' .. titleParts.getPart(1,-1))
    mw.log('titleParts.getPart(-1)  >>  ' .. titleParts.getPart(-1))
    mw.log('titleParts.getPart(-2)  >>  ' .. titleParts.getPart(-2))
    mw.log('titleParts.getPart(-3)  >>  ' .. titleParts.getPart(-3))
    mw.log('titleParts.getPart(-2, 1)  >>  ' .. titleParts.getPart(-2, 1))
    
    mw.log('\r\ntitleParts.partialUri()  >>  ' .. titleParts.partialUri())
    mw.log('titleParts.fullUri()  >>  ' .. titleParts.fullUri())
    
    mw.log('\r\n================\r\n=== Join Paths ===\r\n================')
    mw.log('join_paths("foo/bar","taco/bell")  >>  ' .. join_paths("foo/bar","taco/bell"))
    mw.log('join_paths("foo/bar","/taco/bell")  >>  ' .. join_paths("foo/bar","/taco/bell"))
    mw.log('join_paths("foo/bar/","/taco/bell")  >>  ' .. join_paths("foo/bar/","/taco/bell"))
    --[[
    local titleParts2 = titleParts.join('taco/bell')
    mw.log(p.tableToString(titleParts2))
    ]]--
    
    return titlePartsStr
end

function p.debugX(x, maxDepth)
    local titles = {
        'Wookieepedia:Star_Wars:_Uprising_Super_Walkthrough/Stats/foo/bar',
        'Anoat_sector',
        'Module:UprisingComponents'
    }
    
    return p.debug(titles[x or 0], maxDepth)
end

return p
