# ====================================================
# generator.gap — генерация nodes.json для графа полугрупп
# ====================================================

LoadPackage("smallsemi");
#LoadPackage("smallgrp");

#numWorkers := 4;  # количество процессов (можно менять)
#StartParGAP(numWorkers);

# ---------------- Параметры -----------------
maxN := 6;       # максимальный порядок полугруппы
nodes := [];     # массив для узлов
id := 1;         # счётчик ID

edges2 := [];    # массив рёбер второго типа
edge2_id := 1;   # ID для них

edges := [];     # массив рёбер первого типа
edge_id := 1;    # ID для них

name_to_id := rec();

#if Length(Arguments) >= 1 then
#    maxN := StringToInt( Arguments[1] );
#fi;

# ---------------- Генерация узлов -----------------
for n in [1..maxN] do

    semigroups := AllSmallSemigroups(n);

    for S in semigroups do

        idpair := IdSmallSemigroup(S);
        name := Concatenation("S", String(idpair[1]), "-", String(idpair[2]));

        # Проверка коммутативности
        comm := IsCommutative(S);

        # reversibility: 0=semigroup, 1=monoid, 2=group
        rev := 0;
        if IsMonoidAsSemigroup(S) then 
            rev := 1;
            M := Monoid(S);
            #name := Name(M);
        fi;
        if IsGroupAsSemigroup(S) then
            rev := 2;
            #G := Group(S);
            #name := Name(G);
        fi;

        # ---------------- Таблица Кэли -----------------
        els := Elements(S);
        size := Length(els);

        # функция элемент → индекс 0..n-1
        pos := function(x)
            return Position(els, x) - 1;
        end;

        tbl := [];
        for i in [1..size] do
            row := [];
            for j in [1..size] do
                Add(row, pos(els[i] * els[j]));
            od;
            Add(tbl, row);
        od;

        # ---------------- Создание узла -----------------
        node := rec(
            id := id,
            name := name,
            order := n,
            commutativity := comm,
            reversibility := rev,
            table := tbl
        );

        Add(nodes, node);
        name_to_id.(name) := id;
        id := id + 1;
    od;
od;

Print("The semigroups are generated", "\n");

# ---------------- Рёбра 2 типа -----------------
for n in [1..maxN-1] do
    semigroups := AllSmallSemigroups(n);
    for S in semigroups do
        idpair := IdSmallSemigroup(S);
        name := Concatenation("S", String(idpair[1]), "-", String(idpair[2]));

        # Построение подгруппы с нулём
        SplusZero := function(S)
            local mul, n, tbl, i, j;
            mul := MultiplicationTable(S);
            n := Length(mul);

            tbl := List([1..n+1], k -> []);

            for i in [1..n+1] do
                for j in [1..n+1] do
                    if i = n+1 or j = n+1 then
                        tbl[i][j] := n+1;
                    else
                        tbl[i][j] := mul[i][j];
                    fi;
                od;
            od;

            return SemigroupByMultiplicationTableNC(tbl);
        end;
        
        S2 := SplusZero(S);
                
        idpair2 := IdSmallSemigroup(S2);
        name2 := Concatenation("S", String(idpair2[1]), "-", String(idpair2[2]));

        Add(edges2, rec(
            id := edge2_id,
            nodes := [ name_to_id.(name), name_to_id.(name2) ]
        ));
        edge2_id := edge2_id + 1;
    od;
od;

Print("Edges of the 2nd type are generated", "\n");

# ---------------- Рёбра 1 типа -----------------
AllBijections := function(S, T)
    local elsS, elsT, perms, maps, p, map, map_inv, i;

    elsS := Elements(S);
    elsT := Elements(T);

    perms := PermutationsList(elsT);  # все перестановки T
    maps := [];

    for p in perms do
        map := rec();
        map_inv := rec();
        for i in [1..Length(elsS)] do
            map.(String(elsS[i])) := p[i];
            map_inv.(String(p[i])) := elsS[i];
        od;
        Add(maps, [map, map_inv]);
    od;

    return maps;
end;

IsDistributiveMap := function(S, T, bij)
    local elsS, elsT, mulS, mulT, x, y, z, ix, iy, iz, a, xz, yz, az, zx, zy, za, r, l, map, mapInv;

    elsS := Elements(S);
    elsT := Elements(T);

    map := bij[1];
    mapInv := bij[2];

    mulS := MultiplicationTable(S);
    mulT := MultiplicationTable(T);

    for x in elsS do
        for y in elsS do
            for z in elsT do
                # индексы элементов 
                ix := Position(elsS, x);
                iy := Position(elsS, y);
                iz := Position(elsT, z);

                # x+y и x*z и y*z
                a := elsS[ mulS[ix][iy] ];  # x+y
                xz := elsT[ mulT[Position(elsT, map.(String(x)))][iz] ];
                yz := elsT[ mulT[Position(elsT, map.(String(y)))][iz] ];

                zx := elsT[ mulT[iz][Position(elsT, map.(String(x)))]];
                zy := elsT[ mulT[iz][Position(elsT, map.(String(y)))]];

                az := elsT[ mulT[ Position(elsT, map.(String(a))) ][iz] ];
                za := elsT[ mulT[iz][ Position(elsT, map.(String(a))) ] ];

                # r = (xz)+(yz) ; l = zx + zy
                r := map.(String(elsS[ mulS[Position(elsS, mapInv.(String(xz)))][Position(elsS, mapInv.(String(yz)))]]));

                l := map.(String(elsS[ mulS[Position(elsS, mapInv.(String(zx)))][Position(elsS, mapInv.(String(zy)))]]));

                if az <> r then
                    return false;
                fi;
                if za <> l then
                    return false;
                fi;
            od;
        od;
    od;

    return true;
end;

IsDistributiveSG := function(S, T)
    local bijs, f;

    if Size(S) <> Size(T) then
        return false;
    fi;

    bijs := AllBijections(S, T);

    for f in bijs do
        if IsDistributiveMap(S, T, f) then
            return true;
        fi;
    od;

    return false;
end;

for n in [1..maxN] do
    # Получаем все полугруппы порядка n
    semigroups := AllSmallSemigroups(n);

    # Перебор всех пар S, S2
    for i in [1..Length(semigroups)] do
        S := semigroups[i];
        idpair := IdSmallSemigroup(S);
        id_S := name_to_id.(Concatenation("S", String(idpair[1]), "-", String(idpair[2]))) ;

        if n>4 then
            if not IsGroupAsSemigroup(S) then
                continue;
            fi;
        fi;

        for j in [1..Length(semigroups)] do
            T := semigroups[j];
            idpair2 := IdSmallSemigroup(T);
            id_T := name_to_id.(Concatenation("S", String(idpair2[1]), "-", String(idpair2[2]))) ;
            
            # Проверяем дистрибутивность

            if IsDistributiveSG(S, T) then
                Add(edges, rec(
                    id := edge_id,
                    name := Concatenation("sr", String(edge_id)),
                    nodes := [id_S, id_T],
                    type := 0
                ));
                edge_id := edge_id + 1;
            fi;
        od;
    od;
    Print("Edges of the 1st type: n = ", n, "\n");
od;

Print("Edges of the 1st type are generated", "\n");


# ---------------- Вывод JSON -----------------
outfile := "data.json";

# 1. Начало объекта
PrintTo(outfile,
"{\n",
"  \"nodes\": [\n"
);

# 2. Узлы
for i in [1..Length(nodes)] do
    n := nodes[i];

    if n.commutativity then
        commStr := "1";
    else
        commStr := "0";
    fi;

    if i < Length(nodes) then
        commaNode := "},\n";
    else
        commaNode := "}\n";
    fi;

    AppendTo(outfile,
        "    {\n",
        "      \"id\": ", n.id, ",\n",
        "      \"name\": \"", n.name, "\",\n",
        "      \"order\": ", n.order, ",\n",
        "      \"commutativity\": ", commStr, ",\n",
        "      \"reversibility\": ", n.reversibility, ",\n",
        "      \"table\": [\n"
    );

    # Вывод таблицы Кэли
    for r in [1..Length(n.table)] do
        row := n.table[r];
        AppendTo(outfile, "        [");
        for c in [1..Length(row)] do
            AppendTo(outfile, row[c]);
            if c < Length(row) then
                AppendTo(outfile, ", ");
            fi;
        od;
        if r < Length(n.table) then
            AppendTo(outfile, "],\n");
        else
            AppendTo(outfile, "]\n");
        fi;
    od;

    AppendTo(outfile, "    ]", commaNode);

od;

AppendTo(outfile, "  ],\n");

# 3. Первый тип

AppendTo(outfile, "  \"edges_type_1\": [\n");

for i in [1..Length(edges)] do
    e := edges[i];

    if i < Length(edges) then
        comma := "},\n";
    else
        comma := "}\n";
    fi;

    AppendTo(outfile,
        "    {\n",
        "      \"id\": ", e.id, ",\n",
        "      \"name\": \"", e.name, "\",\n",
        "      \"nodes\": [", e.nodes[1], ", ", e.nodes[2], "],\n",
        "      \"type\": ", 0, "\n",
        "    ", comma
    );
od;
AppendTo(outfile, "  ],\n");

# 4. Второй тип
AppendTo(outfile, "  \"edges_type_2\": [\n");

for i in [1..Length(edges2)] do
    e := edges2[i];

    if i < Length(edges2) then
        comma := "},\n";
    else
        comma := "}\n";
    fi;

    AppendTo(outfile,
        "    {\n",
        "      \"id\": ", e.id, ",\n",
        "      \"nodes\": [", e.nodes[1], ", ", e.nodes[2], "]\n",
        "    ", comma
    );
od;

AppendTo(outfile,
"  ]\n",
"}\n"
);

Print("Saved ", Length(nodes), " nodes to ", outfile, "\n");
quit;