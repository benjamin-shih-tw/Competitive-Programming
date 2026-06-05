#pragma GCC optimize("O3,unroll-loops")
#include <bits/stdc++.h>
#pragma GCC target("avx2,bmi,bmi2,lzcnt,popcnt")
using namespace std;
using ll = long long;
#define pii pair<int,int>
#define SZ(x) ((int)(x).size())
#define ALL(x) (x).begin(),(x).end()
#define fo(i,n) for(int i = 0 ; i < (n) ; i++)
#define foo(i,a,b) for(int i = (a) ; i <= (b) ; i++)
#define F first
#define S second
#define pb push_back

int dx[4] = {1, -1, 0, 0};
int dy[4] = {0, 0, 1, -1};
char dir[4] = {'D', 'U', 'R', 'L'};

int main(){
    ios::sync_with_stdio(0); cin.tie(0);
    int r, c;
    cin >> r >> c;
    
    vector<string> v(r);
    pii start, end;
    
    fo(i, r){
        cin >> v[i];
        fo(j, c){
            if(v[i][j] == 'A') start = {i, j};
            if(v[i][j] == 'B') end = {i, j};
        }
    }
    
    vector<vector<bool>> vis(r, vector<bool>(c, false));
    vector<vector<char>> p(r, vector<char>(c, 0));
    
    queue<pii> q;
    q.push(start);
    vis[start.F][start.S] = true;
    
    bool found = false;
    
    while(!q.empty()){
        auto [x, y] = q.front(); 
        q.pop();
        
        if(x == end.F && y == end.S) {
            found = true;
            break;
        }
        
        fo(i, 4){
            int nx = x + dx[i];
            int ny = y + dy[i];
            

            if(nx < 0 || nx >= r || ny < 0 || ny >= c || v[nx][ny] == '#' || vis[nx][ny]) 
                continue;
            
            vis[nx][ny] = true;
            p[nx][ny] = dir[i]; 
            q.push({nx, ny});
        }
    }
    
    if(found){
        cout << "YES\n";
        string path = "";
        pii curr = end;
        
    
        while(curr != start){
            char d = p[curr.F][curr.S];
            path.push_back(d);
            
            if(d == 'D') curr.F--;
            else if(d == 'U') curr.F++;
            else if(d == 'R') curr.S--;
            else if(d == 'L') curr.S++;
        }
        
        reverse(path.begin(), path.end());
        cout << path.length() << "\n";
        cout << path << "\n";
    } else {
        cout << "NO\n";
    }
    
    return 0;
}